const isPowerOfTwo = (aNumber: number) => {
  return aNumber >= 2 && (aNumber & (aNumber - 1)) === 0;
};

// Src: https://www.techiedelight.com/round-previous-power-2/
export const getPreviousPowerOfTwo = (aNumber: number) => {
  if (isPowerOfTwo(aNumber)) {
    return aNumber / 2;
  }
  // set all bits after the last set bit
  aNumber = aNumber | (aNumber >> 1);
  aNumber = aNumber | (aNumber >> 2);
  aNumber = aNumber | (aNumber >> 4);
  aNumber = aNumber | (aNumber >> 8);
  aNumber = aNumber | (aNumber >> 16);

  // drop all but the last set bit from `n`
  return aNumber - (aNumber >> 1);
};
