export function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

export function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getPoissonRandomNumber (lambda) {
  let L = Math.exp(-lambda)
  let k = 0
  let p = 1
  
  do {
    k = k + 1
    p = p * Math.random()
  } while (p > L)
  
  return k - 1
}

export function getExponentiallyUniform (min= 400, max= 600) {
  return getPoissonRandomNumber(getRandomInt(min, max))
}
