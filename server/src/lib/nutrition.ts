export type Nutrition = {
  servingSize?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  fiber?: number | null;
};

export function scoreNutrition(nutrition?: Nutrition | null) {
  if (!nutrition) return { score: null as number | null, notes: [] as string[] };
  const values = [
    nutrition.calories,
    nutrition.protein,
    nutrition.carbohydrates,
    nutrition.fat,
    nutrition.sugar,
    nutrition.sodium,
    nutrition.fiber,
  ];
  if (values.every((value) => value == null)) {
    return { score: null, notes: [] as string[] };
  }

  let score = 72;
  const notes: string[] = [];

  if ((nutrition.protein ?? 0) >= 15) {
    score += 10;
    notes.push("High protein for this serving");
  } else if ((nutrition.protein ?? 0) >= 8) {
    score += 6;
    notes.push("Good protein for this serving");
  }

  if ((nutrition.fiber ?? 0) >= 5) {
    score += 8;
    notes.push("High fiber");
  } else if ((nutrition.fiber ?? 0) >= 3) {
    score += 4;
    notes.push("Useful fiber");
  }

  if ((nutrition.sodium ?? 0) >= 600) {
    score -= 16;
    notes.push("Sodium is high");
  } else if ((nutrition.sodium ?? 0) >= 400) {
    score -= 8;
    notes.push("Sodium is on the higher side");
  }

  if ((nutrition.sugar ?? 0) >= 15) {
    score -= 12;
    notes.push("Sugar is high for one serving");
  } else if ((nutrition.sugar ?? 0) >= 8) {
    score -= 6;
    notes.push("Watch the sugar");
  }

  if ((nutrition.fat ?? 0) >= 18) {
    score -= 6;
    notes.push("Higher fat serving");
  }

  if (nutrition.calories != null && nutrition.calories <= 80) {
    score += 4;
    notes.push("Light on calories");
  } else if ((nutrition.calories ?? 0) >= 350) {
    score -= 4;
    notes.push("A hearty calorie serving");
  }

  if (!notes.length) notes.push("A fairly balanced label for this serving");

  return { score: Math.max(28, Math.min(96, score)), notes };
}
