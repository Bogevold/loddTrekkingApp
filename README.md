# loddTrekking

Trekker lodd basert på en liste fra 1 til x.
Mulig å variere antall lodd og varighet på trekningen.
Noen stiler (gifer) lagt til for å variere.
Støtter navneregistrering på lodd med localStorage-persistering.

## Forutsetninger

- Docker
- kubectl + Helm mot et K3s/Kubernetes-cluster
- Et lokalt container-registry på `homelab:30500`

## Utviklingssyklus

### Snapshot-testing (rask iterasjon)

Bruk snapshot-flyten for å teste endringer i homelaben uten å bumpe versjon eller lage Git-tags.

```bash
# Bygg, push og deploy snapshot til homelab
make deploy-snapshot

# Når testing er ferdig — reverter til release-versjon
make revert-snapshot
```

`deploy-snapshot` bygger image med tag `:snapshot`, oppdaterer versjonsstrengen i HTML med tidsstempel (`VERSION_TIMESTAMP`), pusher til registry og gjør en `helm upgrade`. `revert-snapshot` setter image tilbake til den nåværende release-versjonen fra `VERSION`-filen.

### Release-flyt

Når endringene er klare for release:

```bash
# 1. Bump versjon
make bump-patch    # 1.0.2 -> 1.0.3
# make bump-minor  # 1.0.2 -> 1.1.0
# make bump-major  # 1.0.2 -> 2.0.0

# 2. Bygg, push image og oppgrader cluster
make upgrade

# 3. Push Git-commits og tags til remote
make git-push
```

`upgrade` kjører `build` → `push` → `helm upgrade` og venter på at rollout er ferdig.

### Første gangs deploy

```bash
make deploy
```

### Versjonsstyring

Gjeldende versjon ligger i `VERSION`-filen. Alle `make bump-*`-kommandoer oppdaterer denne filen. `build` injiserer versjonsstrengen i `app/index.html` automatisk.

## Alle make-kommandoer

```
make help
```
