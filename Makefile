# Makefile for loddtrekking

# Variabler
REGISTRY = homelab:30500
IMAGE_NAME = loddtrekking
VERSION_FILE = VERSION
HELM_CHART = ./loddtrekking-chart

# Les versjon fra fil, eller bruk 0.1.0 som default
VERSION := $(shell cat $(VERSION_FILE) 2>/dev/null || echo "0.1.0")
TS := $(shell date +"%Y%m%d%H%M%S")

# Targets
.PHONY: help version build push-image deploy upgrade snapshot deploy-snapshot revert-snapshot clean bump-patch bump-minor bump-major git-push

help:
	@echo "Tilgjengelige kommandoer:"
	@echo "  make build              - Bygg Docker image med gjeldende versjon"
	@echo "  make push-image         - Push image til registry (ingen git)"
	@echo "  make deploy             - Bygg, push og deploy til K3s (første gang)"
	@echo "  make upgrade            - Oppgrader deployment, så commit og tag"
	@echo "  make snapshot           - Bygg og push snapshot image"
	@echo "  make deploy-snapshot    - Deploy snapshot til homelab for testing"
	@echo "  make revert-snapshot    - Reverter til release-versjon ($(VERSION))"
	@echo "  make bump-patch         - Øk patch-versjon (0.1.0 -> 0.1.1)"
	@echo "  make bump-minor         - Øk minor-versjon (0.1.0 -> 0.2.0)"
	@echo "  make bump-major         - Øk major-versjon (0.1.0 -> 1.0.0)"
	@echo "  make version            - Vis gjeldende versjon"
	@echo "  make git-push           - Push Git commits og tags til remote"
	@echo "  make clean              - Rydd opp lokale images"
	@echo ""
	@echo "Gjeldende versjon: $(VERSION)"

version:
	@echo "Gjeldende versjon: $(VERSION)"


# Bygg snapshot image
snapshot:
	@echo "Bygger image versjon $(VERSION)_$(TS)..."
	@echo "Oppdaterer versjon i HTML..."
	sed -i 's/<div class="version">v[^<]*<\/div>/<div class="version">v$(VERSION)_$(TS)<\/div>/' app/index.html
	docker build -t $(REGISTRY)/$(IMAGE_NAME):snapshot .
	docker push $(REGISTRY)/$(IMAGE_NAME):snapshot
	@echo "Image bygget: $(REGISTRY)/$(IMAGE_NAME):$(VERSION)_$(TS)"

# Deploy snapshot til homelab for testing
deploy-snapshot: snapshot
	@echo "Deployer snapshot til homelab..."
	helm upgrade $(IMAGE_NAME) $(HELM_CHART) --set image.tag=snapshot
	kubectl rollout status deployment/$(IMAGE_NAME)
	@echo "Snapshot deployed! Bruk 'make revert-snapshot' for å gå tilbake."

# Reverter til release-versjon
revert-snapshot:
	@echo "Reverterer til release-versjon $(VERSION)..."
	helm upgrade $(IMAGE_NAME) $(HELM_CHART) --set image.tag=$(VERSION)
	kubectl rollout status deployment/$(IMAGE_NAME)
	@echo "Tilbake på versjon $(VERSION)!"


# Bygg image
build:
	@echo "Bygger image versjon $(VERSION)..."
	@echo "Oppdaterer versjon i HTML..."
	sed -i 's/<div class="version">v[^<]*<\/div>/<div class="version">v$(VERSION)<\/div>/' app/index.html
	docker build -t $(REGISTRY)/$(IMAGE_NAME):$(VERSION) .
	docker tag $(REGISTRY)/$(IMAGE_NAME):$(VERSION) $(REGISTRY)/$(IMAGE_NAME):latest
	@echo "Image bygget: $(REGISTRY)/$(IMAGE_NAME):$(VERSION)"

# Push image til registry (ingen git-operasjoner)
push-image: build
	@echo "Pusher image versjon $(VERSION) til registry..."
	docker push $(REGISTRY)/$(IMAGE_NAME):$(VERSION)
	docker push $(REGISTRY)/$(IMAGE_NAME):latest
	@echo "Image pushet til registry"

# Deploy til K3s (første gang)
deploy: push-image
	@echo "Deployer versjon $(VERSION) til K3s..."
	helm install $(IMAGE_NAME) $(HELM_CHART) --set image.tag=$(VERSION)
	kubectl rollout status deployment/$(IMAGE_NAME)
	@echo "Lager Git commit og tag v$(VERSION)..."
	git add VERSION app/index.html
	git commit -m "Bump version to $(VERSION)" || true
	git tag -a v$(VERSION) -m "Release version $(VERSION)" || echo "Tag v$(VERSION) eksisterer allerede"
	@echo "Deployment fullført!"

# Oppgrader eksisterende deployment — git commit/tag skjer ETTER vellykket rollout
upgrade: push-image
	@echo "Oppgraderer til versjon $(VERSION)..."
	helm upgrade $(IMAGE_NAME) $(HELM_CHART) --set image.tag=$(VERSION)
	kubectl rollout restart deployment/$(IMAGE_NAME)
	kubectl rollout status deployment/$(IMAGE_NAME)
	@echo "Lager Git commit og tag v$(VERSION)..."
	git add VERSION app/index.html
	git commit -m "Bump version to $(VERSION)" || true
	git tag -a v$(VERSION) -m "Release version $(VERSION)" || echo "Tag v$(VERSION) eksisterer allerede"
	@echo "Oppgradering fullført!"

# Øk patch-versjon (0.1.0 -> 0.1.1)
bump-patch:
	@echo "Øker patch-versjon..."
	@echo $(VERSION) | awk -F. '{printf "%d.%d.%d\n", $$1, $$2, $$3+1}' > $(VERSION_FILE)
	@echo "Ny versjon: $$(cat $(VERSION_FILE))"

# Øk minor-versjon (0.1.0 -> 0.2.0)
bump-minor:
	@echo "Øker minor-versjon..."
	@echo $(VERSION) | awk -F. '{printf "%d.%d.0\n", $$1, $$2+1}' > $(VERSION_FILE)
	@echo "Ny versjon: $$(cat $(VERSION_FILE))"

# Øk major-versjon (0.1.0 -> 1.0.0)
bump-major:
	@echo "Øker major-versjon..."
	@echo $(VERSION) | awk -F. '{printf "%d.0.0\n", $$1+1}' > $(VERSION_FILE)
	@echo "Ny versjon: $$(cat $(VERSION_FILE))"

# Rydd opp
clean:
	@echo "Rydder opp lokale images..."
	docker rmi $(REGISTRY)/$(IMAGE_NAME):$(VERSION) || true
	docker rmi $(REGISTRY)/$(IMAGE_NAME):latest || true
	@echo "Opprydding fullført"

# Full workflow: bump versjon, bygg, push og oppgrader
release-patch: bump-patch upgrade
	@echo "Patch release fullført! Versjon: $$(cat $(VERSION_FILE))"

release-minor: bump-minor upgrade
	@echo "Minor release fullført! Versjon: $$(cat $(VERSION_FILE))"

release-major: bump-major upgrade
	@echo "Major release fullført! Versjon: $$(cat $(VERSION_FILE))"

# Push Git commits og tags til remote
git-push:
	@echo "Pusher Git commits og tags til remote..."
	git push
	git push --tags
	@echo "Git push fullført!"
