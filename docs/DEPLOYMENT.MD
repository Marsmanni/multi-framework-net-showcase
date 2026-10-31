
# Deployment Guide

## Overview

This repository uses GitHub Actions to automate build and deployment for all major projects:
- `sample-ui5` (UI5 app, SFTP deploy)
- `sample-react` (React app, SFTP deploy)
- `UI-Sample-API-NET1020251207105113` (.NET API, Azure App Service deploy)

---

## Workflow Triggers

| Project      | Workflow File                                               | Trigger Paths / Branch      | Manual Dispatch |
|--------------|------------------------------------------------------------|----------------------------|-----------------|
| sample-ui5   | `.github/workflows/sample-ui5.yml`                         | `sample-ui5/**` on `prod`  | Yes             |
| sample-react | `.github/workflows/sample-react.yml`                       | `sample-react/**` on `prod`| Yes             |
| .NET API     | `.github/workflows/master_ui-sample-api-net1020251207105113.yml` | `UI-Sample-API-NET10/**`, `UI-Sample-API-NET8/**`, `UI-Sample-API.Shared/**` on `prod` | Yes |

---

## Build & Deploy Steps

### sample-ui5

- **Build:**  
  - Node.js 22, `npm ci`, `npx ui5 build`
  - Uploads `sample-ui5/dist` as artifact
- **Deploy:**  
  - Downloads artifact
  - Installs `sshpass`
  - Checks SFTP password secret
  - Dynamically creates all needed remote directories
  - Uploads build output to `~/apps/sample-ui5` via SCP

### sample-react

- **Build:**  
  - Node.js 18, `npm ci`, `npm run build`
  - Uploads `sample-react/dist` as artifact
- **Deploy:**  
  - Downloads artifact
  - Installs `sshpass`
  - Checks SFTP password secret
  - Uploads build output to `~/apps/sample-react` via SCP

### .NET API (Azure App Service)

- **Build:**  
  - Windows runner, .NET 10.x
  - `dotnet build` and `dotnet publish` for `UI-Sample-API-NET10`
  - Uploads published output as artifact
- **Deploy:**  
  - Downloads artifact
  - Azure login using OIDC and secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`)
  - Deploys to Azure Web App `UI-Sample-API-NET1020251207105113` (Production slot)

---

## Security

- **Secrets:**  
  - SFTP and Azure credentials are stored in GitHub Secrets.
- **No credentials in code:**  
  - All sensitive data is referenced via `${{ secrets.SECRET_NAME }}`.

---

## Manual Deployment

You can trigger any workflow manually from the GitHub Actions UI by selecting the workflow and clicking "Run workflow".

---

## Troubleshooting

- **Build errors:**  
  - Check the respective build job logs.
- **Deployment errors:**  
  - For SFTP: Check credentials and server reachability.
  - For Azure: Check secret presence and Azure resource status.
- **Directory issues:**  
  - The workflow dynamically creates all needed directories, so missing folders should not cause upload failures.

---

## Notes

- The script `git-to-prod.ps1` currently contains no logic.
- All workflows are designed to only trigger and deploy when relevant project folders change.