# 🧠 NeuralDecode 3D — Interactive 3D Deep Learning Architecture Engine

[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r164-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

> **NeuralDecode 3D** is an open-source, interactive WebGL 3D visualizer and deep learning inspection engine. Designed to make modern AI architectures (Transformers, Mixture of Experts, ResNet-50 CNNs, Mamba SSMs, and Latent Diffusion) intuitively understandable for researchers, students, and curious 5-year-olds alike!

Created with ❤️ by **[Bala Venkatesh](https://balavenkatesh3322.github.io/bala_venkatesh_profile/)**.

---

## 🌟 Key Features

- **🌐 5 Modern 3D Deep Learning Models**:
  - **Transformer (Decoder-Only / GPT-4 & Llama 3)**: Multi-Head Attention, RoPE Positional Embeddings, SwiGLU FFN, and Causal Masking matrices.
  - **Mixture of Experts (MoE / DeepSeek-V3 & Mixtral)**: Router Gating Top-K Dispatch and Shared/Specialized Expert routing.
  - **Vision CNN (ResNet-50)**: Residual Skip Connections, 3x3 Convolutions, Bottleneck Blocks, and Global Average Pooling.
  - **Mamba State Space Model (SSM)**: Selective SSM B(t)/C(t) parameterization and Parallel Scan.
  - **Latent Diffusion Model (Stable Diffusion)**: Text-conditioned U-Net noise prediction and Latent Space Denoising.

- **⚡ Live Sequential Training Simulator**:
  - Step-by-step automatic animation streaming through each layer.
  - Live metric graphs tracking Epochs, Loss (MSE), and Accuracy (%).
  - Real-time mathematical equation console and output tensor expressions.

- **🎨 3D Interactive Tool Ribbon**:
  - **Reset View**: Clears layer isolation and resets camera angle.
  - **Isolate Layer**: Fades non-selected nodes into transparent ghosts (`0.05 opacity`) to highlight selected layer.
  - **X-Ray Wireframe Mode**: Renders 3D node geometries as high-tech glowing wireframes.
  - **Cross-Section Cutaway View**: Exposes internal weight matrices and channel tensor volumes.

- **🧸 5-Year-Old "Why It Happened" Explanations**:
  - Plain-language analogies explaining what every component does and why it is critical.

- **✨ Silky Smooth Animations & Celebrations**:
  - Powered by **Framer Motion** spring physics (`stiffness: 350, damping: 25`).
  - Celebratory **Canvas Confetti** fireworks upon completing training passes.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (TypeScript) |
| **Build Tooling** | Vite 5 |
| **3D Engine** | Three.js + `@react-three/fiber` + `@react-three/drei` |
| **Animations** | Framer Motion + Canvas Confetti |
| **Styling** | Tailwind CSS + Anatomy Atelier Editorial Palette (`#FBF9F5` Cream base) |
| **Icons** | Lucide React |
| **Deployment** | Vercel (`vercel.json`) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 18.0.0`
- [npm](https://www.npmjs.com/) `>= 9.0.0`

### Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/balavenkatesh3322/neural-decode-3d.git
   cd neural-decode-3d
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## ☁️ Deploying to Vercel

This repository includes a pre-configured `vercel.json` file.

### Option A: One-Click Terminal Deploy
```bash
npx vercel --prod
```

### Option B: Deploy via Vercel Web Dashboard
1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new) and import `neural-decode-3d`.
3. Vercel will automatically detect Vite settings and deploy!

---

## 🤝 How to Contribute

Contributions, issues, and feature requests are welcome! Feel free to check out the [Issues Page](https://github.com/balavenkatesh3322/neural-decode-3d/issues).

1. **Fork the Project**
2. **Create a Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 👨‍💻 Creator & Maintainer

Created with passion by **Bala Venkatesh**.

- **Portfolio**: [balavenkatesh3322.github.io/bala_venkatesh_profile](https://balavenkatesh3322.github.io/bala_venkatesh_profile/)
- **GitHub**: [@balavenkatesh3322](https://github.com/balavenkatesh3322)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
