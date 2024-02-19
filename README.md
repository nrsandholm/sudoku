# Sudoku

Current version at http://sudoku-2154b72ff2.s3-website.eu-central-1.amazonaws.com.

## App

### Build

```
cd app/sudoku
npm run build
```

## Infra

### Build/Synth

This is optional. Deploy does this implicitly.

```
cd infra
npm run cdk synth
```

### Deploy

```
cd infra
npm run cdk deploy
```