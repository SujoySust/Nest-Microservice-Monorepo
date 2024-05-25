export async function processStartingTasks() {
  try {
    // app.get(CurrencyService).syncUsdRates();
  } catch (e) {
    // console.log(e.stack, LOG_LEVEL_ERROR);
  }
}

// export async function cacheUserWalletAddresses(
//   network: B_NetworkModel,
//   fromDbMust = false,
// ): Promise<string[]> {
//   let addresses: string[];
//   let cacheData: string;
//   if (!fromDbMust) {
//     cacheData = await redis_client.get(
//       `${network.slug}:${CACHE_KEYS.WALLET_ADDRESSES}`,
//     );
//   }
//   if (!cacheData) {
//     const walletKeys = await prisma_client.walletKey.findMany({
//       where: { network_id: network.id },
//       select: { address: true },
//     });
//     addresses = walletKeys.map((walletKey) => walletKey.address);
//   } else {
//     addresses = cacheData.split(',');
//   }

//   if (!cacheData) {
//     addresses.length &&
//       (await redis_client.set(
//         `${network.slug}:${CACHE_KEYS.WALLET_ADDRESSES}`,
//         addresses.toString(),
//       ));
//   }
//   return addresses;
// }
