interface Meal {
  id: string
  name: string
  description: string
  date: string
  hour: string
  diet: number
}

export async function findBestSequence(meals: Array<Meal>) {
  let bestStart = -1
  let bestLength = 0
  let currentStart = -1
  let currentLength = 0

  for (let i = 0; i < meals.length; i++) {
    if (meals[i].diet === 1) {
      currentLength++

      if (currentStart === -1) {
        currentStart = i
      }
    } else {
      if (currentLength > bestLength) {
        bestLength = currentLength
        bestStart = currentStart
      }

      currentStart = -1
      currentLength = 0
    }
  }

  if (currentLength > bestLength) {
    bestLength = currentLength
    bestStart = currentStart
  }

  return { total: bestLength }
}
