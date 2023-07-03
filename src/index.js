import { AuthProvider } from "@arcana/auth";

// Dev Dashboard
//const clientId = "xar_dev_19527cdf585cd31d0bd06bfc1b008accea781404"; //arc4n4-xar ponyo dev
//wallet address 0xD12E6864A0f0f3Ea886400Ae7570E4341889bDa9
//const clientId = "xar_test_d24f70cd300823953dfa2a7f5b7c7c113356b1ad"; //arc4n4-xar ponyo testnet
//wallet address

// Mainnet dashboard
const clientId = "xar_test_87f34a9c7879cd4b726ba36a99e164837d70143a"; //arc4n4-xar testnet quills
// wallet address 0xea8887Ad419058b9b844430F3Dc01e89Ca90d786
//const clientId = "xar_live_d7c88d9b033d100e4200d21a5c4897b896e60063"; //arc4n4-xar mainnet quills
//wallet address 0xbd1127C076c91274B9Ccd6c506817D364bc7ff80

//sample app
//const clientId = "xar_test_a0e41e607895ba9654123a78c88281311a685446";

const auth = new AuthProvider(`${clientId}`, {
  //required
  network: "testnet", //defaults to 'testnet'
  //network: "mainnet", //defaults to 'testnet'
  position: "right", //defaults to right
  theme: "dark", //defaults to dark
  alwaysVisible: true, //defaults to true which is Full UI mode
  chainConfig: {
    chainId: "80001", //defaults to CHAIN.ETHEREUM_MAINNET
    rpcUrl: "https://rpc.ankr.com/polygon_mumbai" //defaults to 'https://rpc.ankr.com/eth'
  }
});

async function logout() {
  console.log("Requesting logout");
  try {
    await auth.logout();
    document.querySelector("#result").innerHTML =
      "Logout: You are now logged out!";
  } catch (e) {
    console.log({ e });
  }
}

async function initAuth() {
  console.log("Intantiating Auth... ");
  document.querySelector("#result").innerHTML =
    "Initializing Auth. Please wait...";
  try {
    await auth.init();
    console.log("Init auth complete!");
    document.querySelector("#result").innerHTML =
      "Auth initialized. Now you can continue.";
    console.log({ provider });
  } catch (e) {
    console.log(e);
  }
}

export async function connect() {
  try {
    await auth.connect();
    document.querySelector("#result").innerHTML =
      "Connect: User logged in successfully!";
  } catch (e) {
    console.log(e);
  }
}

async function getAccounts() {
  console.log("Requesting accounts");
  try {
    const accounts = await auth.provider.request({ method: "eth_accounts" });
    console.log({ accounts });
    document.querySelector("#result").innerHTML = accounts[0];
  } catch (e) {
    console.log(e);
  }
}

async function addChain() {
  try {
    await auth.provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "8081",
          chainName: "Shardeum Liberty 2.X",
          blockExplorerUrls: ["https://explorer-liberty20.shardeum.org/"],
          rpcUrls: ["https://liberty20.shardeum.org/"],
          nativeCurrency: {
            symbol: "SHM"
          }
        }
      ]
    });
    document.querySelector("#result").innerHTML =
      "Shardeum chain added successfully!";
  } catch (e) {
    console.log({ e });
  }
}

async function switchChain() {
  try {
    await auth.provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: "8081"
        }
      ]
    });
    document.querySelector("#result").innerHTML =
      "Switched to the Shardeum chain successfully!";
  } catch (e) {
    console.log({ e });
  }
}

initAuth();

document.querySelector("#Btn-Init-Auth").addEventListener("click", connect);

document
  .querySelector("#Btn-GetAccounts")
  .addEventListener("click", getAccounts);

document.querySelector("#Btn-AddChain").addEventListener("click", addChain);

document
  .querySelector("#Btn-SwitchChain")
  .addEventListener("click", switchChain);

document.querySelector("#Btn-Logout").addEventListener("click", logout);
