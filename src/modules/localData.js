export const storageKey = 'favoriteCities'

export function saveFavoriteCities(cities) {
  localStorage.setItem(storageKey, JSON.stringify([...cities]))

  const lastSelectedCity = [...cities].pop()
  localStorage.setItem('lastSelectedCity', lastSelectedCity)
}

export function getFavoriteCities() {
  const citiesJSON = localStorage.getItem(storageKey)
  return citiesJSON ? new Set(JSON.parse(citiesJSON)) : new Set()
}
