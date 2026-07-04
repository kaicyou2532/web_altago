This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker Image

Build the production image before deploying it with Argo CD:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t your-registry/alta-go:latest .
```

Push the image from CI, then reference the pushed tag from your Kubernetes manifests:

```bash
docker push your-registry/alta-go:latest
```

The container listens on port `3000`.

## Deploy to k3s with Argo CD

Kubernetes manifests are in `k8s/base`, and the Argo CD `Application` is in `k8s/argocd/application.yaml`.

Before syncing with Argo CD:

1. Build and push the image to your registry.
2. Update the image in `k8s/base/deployment.yaml` or `k8s/base/kustomization.yaml`.
3. Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `k8s/base/configmap.yaml`.
4. Update the Ingress host in `k8s/base/ingress.yaml`.

Apply the Argo CD application from your k3s kubeconfig:

```bash
kubectl apply -f k8s/argocd/application.yaml
```

The default manifests assume k3s' bundled Traefik ingress controller and expose the app at `http://alta-go.local`.
