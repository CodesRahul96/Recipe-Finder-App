export const ingredientDictionary = {
  Chicken: "मुर्गा (Chicken)",
  "Chicken Breast": "मुर्गे का सीना (Chicken Breast)",
  Butter: "मक्खन",
  Ghee: "घी",
  Oil: "तेल",
  Salt: "नमक",
  Sugar: "चीनी",
  Onion: "प्याज",
  Garlic: "लहसुन",
  Ginger: "अदरक",
  Tomato: "टमाटर",
  Potato: "आलू",
  Spinach: "पालक",
  Chilli: "मिर्च",
  "Green Chilli": "हरी मिर्च",
  "Red Chilli": "लाल मिर्च",
  Turmeric: "हल्दी",
  Cumin: "जीरा",
  Coriander: "धनिया",
  "Coriander Leaves": "धनिया पत्ती",
  "Garam Masala": "गरम मसाला",
  Yogurt: "दही",
  Curd: "दही",
  Milk: "दूध",
  Cream: "मलाई / क्रीम",
  Rice: "चावल",
  Flour: "आटा",
  "Wheat Flour": "गेहूं का आटा",
  Chickpeas: "छोले / चना",
  Lentils: "दाल",
  Paneer: "पनीर",
  Lemon: "नींबू",
  "Lemon Juice": "नींबू का रस",
  Water: "पानी",
  Fenugreek: "मेथी",
  "Mustard Seeds": "सरसों के बीज",
  Cloves: "लौंग",
  Cardamom: "इलायची",
  Cinnamon: "दालचीनी",
  "Bay Leaf": "तेज पत्ता",
  "Cashew Nuts": "काजू",
  Almonds: "बादाम",
  Raisins: "किशमिश",
  Saffron: "केसर",
};

export const translateIngredient = (name) => {
  if (!name) return "";
  // Case-insensitive lookup
  const key = Object.keys(ingredientDictionary).find(
    (k) => k.toLowerCase() === name.trim().toLowerCase()
  );
  return key ? ingredientDictionary[key] : name;
};
