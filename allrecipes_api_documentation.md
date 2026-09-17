# Allrecipes (allrecipes.com) API & Data Architecture Analysis

## 1. Executive Summary
- **Target URL:** `https://www.allrecipes.com/`
- **Parent Company:** Dotdash Meredith (People Inc.)
- **Public API Status:** **None** (No public REST or GraphQL endpoints exposed for developers)
- **Scraping / Bot Defense:** Cloudflare Enterprise Bot Management with **HTTP 402 Payment Required** commercial licensing gate.
- **Recommended Free Alternative:** **TheMealDB API** (100% free, CORS-friendly, JSON REST API)

---

## 2. Security & Anti-Scraping Architecture (HTTP 402 Gate)

When automated scrapers, scripts, or non-browser HTTP clients attempt to access `allrecipes.com`, Dotdash Meredith's edge infrastructure responds with an **HTTP 402 Payment Required** error:

```http
HTTP/2 402 
server: cloudflare
date: Thu, 17 Sep 2026 17:15:09 GMT
content-type: text/html
nel: {"report_to":"network-errors"}
```

### Edge Paywall Response Body
```html
<p>
  If you are a reader experiencing an access issue, please contact
  <a href="mailto:support@people.inc">support@people.inc</a>. <br>
  To help us troubleshoot more quickly, you may include your IP address.
</p>

<p>
  If you would like to access our content for licensing, please contact
  <a href="mailto:contentlicensing@people.inc">contentlicensing@people.inc</a>.
</p>
```

Dotdash Meredith treats automated traffic as unauthorized commercial data harvesting and requires developers to purchase a commercial data licensing agreement via `contentlicensing@people.inc`.

---

## 3. Internal Data Delivery Mechanism (Schema.org JSON-LD)

While Allrecipes does not expose a traditional API endpoint, its web pages are server-side rendered with embedded **Schema.org `Recipe` JSON-LD** metadata in the `<head>` section:

```html
<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "Recipe",
  "name": "Classic Lasagna",
  "image": "https://www.allrecipes.com/thmb/lasagna.jpg",
  "description": "An authentic homemade lasagna recipe with layers of cheese and meat sauce.",
  "prepTime": "PT30M",
  "cookTime": "PT2H30M",
  "totalTime": "PT3H",
  "recipeYield": "8 servings",
  "recipeIngredient": [
    "1 pound sweet Italian sausage",
    "1 pound lean ground beef",
    "1/2 cup minced onion",
    "2 cloves garlic, crushed",
    "1 (28 ounce) can crushed tomatoes",
    "12 lasagna noodles",
    "16 ounces ricotta cheese",
    "1 egg",
    "3/4 pound mozzarella cheese, sliced",
    "3/4 cup grated Parmesan cheese"
  ],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "text": "In a Dutch oven, cook sausage, ground beef, onion, and garlic over medium heat until well browned."
    },
    {
      "@type": "HowToStep",
      "text": "Cook lasagna noodles in boiling water for 8 to 10 minutes. Drain noodles, and rinse with cold water."
    }
  ],
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "448 calories",
    "carbohydrateContent": "36.5 g",
    "proteinContent": "29.7 g",
    "fatContent": "21.3 g"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "3420"
  }
}
</script>
```

---

## 4. Production-Ready Alternative Recipe APIs

If you are building a mobile or web app (React, MERN, Flutter, Kotlin), using official public recipe APIs avoids Cloudflare IP blocks, captcha challenges, and breaking schema changes:

### 4.1 TheMealDB (Free & Open REST API)
- **Base URL:** `https://www.themealdb.com/api/json/v1/1/`
- **Auth Required:** No (Free test key `1`)
- **CORS Enabled:** Yes (Can be called directly from frontend apps)

#### Key Endpoints:
| Feature | Method | Endpoint | Example Request |
| :--- | :--- | :--- | :--- |
| **Search by Name** | `GET` | `/search.php?s={query}` | `curl "https://www.themealdb.com/api/json/v1/1/search.php?s=pasta"` |
| **Lookup by ID** | `GET` | `/lookup.php?i={id}` | `curl "https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772"` |
| **Random Meal** | `GET` | `/random.php` | `curl "https://www.themealdb.com/api/json/v1/1/random.php"` |
| **List Categories**| `GET` | `/categories.php` | `curl "https://www.themealdb.com/api/json/v1/1/categories.php"` |
| **Filter by Category** | `GET` | `/filter.php?c={category}` | `curl "https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood"` |
| **Filter by Ingredient** | `GET` | `/filter.php?i={ingredient}`| `curl "https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast"` |

### 4.2 Spoonacular Food & Recipe API
- **Website:** `https://spoonacular.com/food-api`
- **Features:** Autocomplete search, complex recipe filtering, ingredient substitution, calorie calculation, meal planner.
- **Free Tier:** 150 free points per day.

### 4.3 Edamam Recipe Search API
- **Website:** `https://developer.edamam.com/edamam-recipe-api`
- **Features:** 2.3+ million recipes, detailed dietary flags (vegan, gluten-free, keto, low-sodium), full macro/micronutrient breakdowns.
- **Free Tier:** 10,000 monthly queries.
