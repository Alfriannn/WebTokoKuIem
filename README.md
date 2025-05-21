# toko-ku

A modern e-commerce web app built with [Next.js](https://nextjs.org), Prisma, and Tailwind CSS.

## 🚀 Features

- User & Admin dashboard
- Product management (CRUD)
- Cart & Checkout (with stock update)
- Order history & admin order management
- Modern UI with Tailwind CSS

## 🛠️ Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/Alfriannn/WebTokoKuIem.git
   cd toko-ku
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup environment variables**

   Copy `.env.example` to `.env` and edit as needed (database, etc):

   ```bash
   cp .env.example .env
   ```

4. **Setup the database**

   Edit your `.env` with your database URL, then run:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

- **Admin page:** `/admin`
- **User account:** `/account`
- **Cart:** `/cart`
- **Checkout:** `/checkout`

## 📦 Tech Stack

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL/MySQL/SQLite] (choose your DB)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 🖼️ Assets

- Place static images (e.g. admin avatar) in the `/public` folder.

## 📄 License

MIT

---

> _Feel free to fork, modify, and contribute!_
