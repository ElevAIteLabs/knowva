# 📊 KNOWva Bulk Import Guide

I have created a template file for you: [KNOWva_Importer_Template.csv](file:///c:/Users/uppal/Downloads/knowva-design-lab-main%20(1)/knowva-design-lab-main/KNOWva_Importer_Template.csv)

You can open this file in Excel, fill it out, and then use the **"Bulk Import Excel"** button in your Admin Dashboard.

## 📝 Column Formatting Guide

| Column | Description | Format Example |
| :--- | :--- | :--- |
| **Name** | Name of the AI tool | `ChatGPT` |
| **Description** | Brief overview | `An advanced AI chatbot...` |
| **Category**| Tool category | `Text Generation` or `Image Generation` |
| **Pricing** | Pricing model label | `Free`, `Freemium`, or `Paid` |
| **Website URL** | Official link | `https://chatgpt.com` |
| **Rating** | Rating from 1 to 5 | `4.8` |
| **Icon URL** | URL of logo or filename | `https://domain.com/logo.png` or `logo.png` |
| **Media URLs** | Screenshots (comma separated) | `img1.png, img2.png, img3.png` |
| **Pros / Cons** | Lists (comma separated) | `Fast, Accurate, Easy to use` |
| **Features** | List of key features | `Real-time chat, Code generation` |
| **Prompts** | Example prompts | `Write a poem about space., Explain gravity.` |
| **FAQs** | Question & Answer pairs | `Question | Answer, Another Q | Another A` |
| **Pricing Tiers** | Detailed plans (JSON format) | See JSON guide below |

---

## 🛠️ Advanced Field Formatting

### 1. FAQs (Question & Answer)
Use a **pipe** (`|`) to separate the question from the answer, and a **comma** to separate different FAQs.
> **Example:** `How to use? | Sign up at website, Is it free? | Yes it is`

### 2. Pricing Tiers (Sub-Plans)
For multiple plans with specific features, use JSON format.
> **Example:**
> ```json
> [
>   {
>     "name": "Pro Plan",
>     "price": "$20",
>     "interval": "/mo",
>     "features": ["Feature A", "Feature B"]
>   }
> ]
> ```
> *Note: In CSV/Excel, make sure any double quotes inside the JSON are escaped (e.g., `""name"": ""Pro""`) or the whole cell is quoted correctly.*

### 3. Media Assets
If you upload images via the "Choose Gallery Assets" button along with your Excel file, just put the **filenames** (e.g., `screenshot1.png`) in the **Media URLs** column. The system will match them automatically.

---

> [!TIP]
> If a tool already exists with the same **Name**, the importer will **Update** the existing entry instead of creating a duplicate. This is great for bulk-updating info!
