export const calculateSKDPrice = async () => {
  return {
    usd: 0,
    ngn: 0,
  };
};

export const convertSKD = async (amount, currency) => {
  const rates = await calculateSKDPrice();

  if (currency === 'USD') {
    return amount * rates.usd;
  }

  if (currency === 'NGN') {
    return amount * rates.ngn;
  }

  return 0;
};
