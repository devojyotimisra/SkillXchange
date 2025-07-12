# 🧠💬 Skill Swap: Share a Skill, Gain a Skill

Hey there, curious human 👋 — welcome to **Skill Swap**, the friendliest corner of the internet where folks exchange talents like Pokémon cards, but with fewer rules and more real-life utility.

Whether you're a Photoshop wizard looking to learn Excel, or a baking boss eager to get guitar tips, we got you covered.

---

## 📚 Table of Contents

1. [✨ What is Skill Swap?](#-what-is-skill-swap)
2. [👩‍💻 User Features](#-user-features)
3. [🧪 Local Dev Setup (a.k.a. "Let me break it and fix it myself mode")](#-local-dev-setup-aka-let-me-break-it-and-fix-it-myself-mode)

   * [1️⃣ Clone the Repository](#1-clone-the-repository)
   * [2️⃣ Backend Setup with UV + Flask](#2-backend-setup-with-uv--flask)
   * [3️⃣ Frontend Setup with React + NPM](#3-frontend-setup-with-react--npm)
   * [4️⃣ Run the App!](#4-run-the-app)
4. [🔗 Useful Links](#-useful-links)

---

## ✨ What is Skill Swap?

Skill Swap is a simple (yet powerful!) platform where you can list the **skills you offer**, request the **skills you want**, and arrange swaps with like-minded users. It’s the wholesome barter economy — but for your brain. 🧠⚡

---

## 👩‍💻 User Features

Here's what you can do once you're in:

* **🧑‍🎨 Profile Setup**: Add your name, a chill pic, and maybe your city (or don't — we're cool with it).
* **🧾 List Skills Offered and Wanted**: Flex your talents and tell us what you'd like to learn.
* **🕒 Set Your Availability**: Are you a weekend warrior? A midnight hacker? Let folks know.
* **🔒 Privacy Toggle**: Keep your profile public or go stealth mode.
* **🔍 Search and Browse**: Find users by skill keywords like "Photoshop", "Excel", or even "Lego Architecture".
* **🔁 Send and Manage Swap Requests**:

  * Accept or reject requests.
  * View current and pending swaps.
  * Delete unaccepted swap requests like a boss.
* **🌟 Ratings & Feedback**: Rate your swap buddy after a session. Be kind. 😇

---

## 🧪 Local Dev Setup (a.k.a. "Let me break it and fix it myself mode")

Wanna hack it locally? Let’s roll.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/devojyotimisra/SkillXchange.git
cd SkillXchange
```

Yes, cloning the repo is the sacred first step. Always.

---

### 2️⃣ Backend Setup with UV + Flask 🐍🔥

We’re using [uv](https://github.com/astral-sh/uv) — the new lightning-fast Python package manager ⚡.

Make sure you have Python 3.11+ and [uv](https://docs.astral.sh/uv/) installed.

Then:

```bash
cd BackendFlask
uv run flask run
```

---

### 3️⃣ Frontend Setup with React + NPM ⚛️📦

We love React. We love NPM. You’re gonna love them too.

Make sure you have [Node.js](https://nodejs.org/en) installed (it comes with [npm](https://docs.npmjs.com/)).

Then:

```bash
cd FrontendReact
npm install
npm run dev
```

Boom! Your React frontend is alive at `http://localhost:5173`.

---

### 4️⃣ Run the App!

With Flask backend running at `http://localhost:5000` and React frontend at `http://localhost:5173`, you’re all set.

Although dont forget to update the environemnt variables accordingly (PS: if you are working in replicating this in your local system)

Check the browser. Smile. You did it. 🎉

---

## 🔗 Useful Links

Here are the cool kids’ tables:

* **React Docs**: [https://react.dev](https://react.dev)
* **NPM Docs**: [https://docs.npmjs.com/](https://docs.npmjs.com/)
* **UV Docs**: [https://docs.astral.sh/uv/](https://docs.astral.sh/uv/)
* **Flask Docs**: [https://flask.palletsprojects.com/](https://flask.palletsprojects.com/)

---

Still here? Go ahead. Run it, build it, break it, fix it, share it. And remember — **someone out there is waiting to swap skills with you.** 🌍🤝