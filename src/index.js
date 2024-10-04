import { AuthProvider } from "@arcana/auth";

/* For contract deployment following are needed */
import { ethers } from "ethers";
/*import { fs } from "fs";*/

let provider;
let from = ""; // get from eth_accounts call
let userPK; // public key corresponding to the email ID, verifier
let isPasskeySet = false;

let {
  ENV_ARCANA_CLIENTID, 
  ENV_ARCANA_WALLET_UI_POSITION,
  ENV_ARCANA_THEME, 
  ENV_ARCANA_NETWORK,
  ENV_ARCANA_WALLET_VISIBLE,
  ENV_ARCANA_COMPACT_MODE,
  ENV_ARCANA_DEFAULT_CHAINID,
  ENV_USER_LOGIN_EMAIL,
  ENV_USER_LOGIN_VERIFIER,
  ENV_ADD_CHAIN_ID,
  ENV_ADD_CHAIN_NAME,
  ENV_ADD_CHAIN_SYM,
  ENV_ADD_CHAIN_RPC_URL,
  ENV_ADD_CHAIN_BLK_EXP_URL,
  ENV_SWITCH_CHAIN_ID,
  ENV_QUERY_PUBLIC_KEY_FOR_ID,
  ENV_QUERY_PUBLIC_KEY_FOR_ID_VERIFIER
} = process.env;

console.log (" ENV_ARCANA_CLIENTID ", ENV_ARCANA_CLIENTID);
if (process.env.NODE_ENV === 'development') {
  console.log('Happy developing!');
} else {
  console.log('Happy production!');
}

const auth = new AuthProvider(ENV_ARCANA_CLIENTID, {
  network: ENV_ARCANA_NETWORK,
  position: ENV_ARCANA_WALLET_UI_POSITION,
  theme: ENV_ARCANA_THEME, //defaults to dark
  alwaysVisible: ENV_ARCANA_WALLET_VISIBLE, //defaults to true which is Full UI mode
  //appMode: "1",
  connectOptions: {
    compact: ENV_ARCANA_COMPACT_MODE
  },
  chainConfig: {
    chainId: ENV_ARCANA_DEFAULT_CHAINID
  }
});

provider = auth.provider;
setHooks();

function setHooks() {
  provider.on("connect", async (params) => {
    console.log({ type: "connect", params: params });
    document.querySelector("#event").innerHTML = "connect Event";
  });
  provider.on("accountsChanged", (params) => {
    console.log({ type: "accountsChanged", params: params });
    document.querySelector("#event").innerHTML = "accountsChanged Event";
  });
  provider.on("chainChanged", async (params) => {
    console.log({ type: "chainChanged", params: params });
    document.querySelector("#event").innerHTML = "chainChanged Event";
  });
  provider.on("disconnect", async (params) => {
    console.log({ type: "disconnect", params: params });
    document.querySelector("#event").innerHTML = "disconnect Event";
  });
  provider.on("message", async (params) => {
    console.log({ type: "message", params: params });
    document.querySelector("#event").innerHTML = "message Event";
  });
}

async function initAuth() {
  try {
    console.log("Intantiating Auth... ");
    document.querySelector("#result").innerHTML =
      "Initializing Auth. Please wait...";
    console.time("auth_init");
    await auth.init();
    console.timeEnd("auth_init");
    console.log("Init auth complete!");
    document.querySelector("#result").innerHTML =
      "Auth initialized. Now you can continue.";
    console.log({ provider });
  } catch (e) {
    console.log({ e });
  }
}

async function getLogins() {
  let authOptions = "";
  try {
    console.log("Get logins");
    const logins = await auth.getLogins();
    for (var i = 0; i < logins.length; i++) {
      authOptions = authOptions + logins[i].toString() + ", ";
    }
    authOptions = authOptions.slice(0, -1);
    document.querySelector("#result").innerHTML =
      "Available Auth Options: \n" + authOptions;
    console.log({ logins });
  } catch (e) {
    console.log(e);
  }
}

async function getAppId() {
  try {
    const appId = await auth.appId;
    console.log("App id:", appId);
    document.querySelector("#result").innerHTML = "AppId: " + appId;
  } catch (e) {
    console.log(e);
  }
}

async function getTheme() {
  try {
    const theme = await auth.theme;
    console.log("wallet theme:", theme);
    document.querySelector("#result").innerHTML = "Wallet Theme: " + theme;
  } catch (e) {
    console.log(e);
  }
}

async function getLogo() {
  try {
    const logo = await auth.logo;
    console.log("wallet logo:", logo);
    document.querySelector("#result").innerHTML =
      "Wallet Logo Horizontal: " +
      logo.horizontal +
      "Wallet logo Vertical: " +
      logo.vertical;
  } catch (e) {
    console.log(e);
  }
}

async function connect() {
  try {
    await auth.connect();
    document.querySelector("#result").innerHTML =
      "Connect: User logged in successfully!";
  } catch (e) {
    console.log(e);
  }
}

async function isLoggedIn() {
  try {
    let ans = await auth.isLoggedIn();
    if (true == ans)
      document.querySelector("#result").innerHTML =
        "Yes, User: " +
        ENV_USER_LOGIN_EMAIL +
        "is logged in aready!";
    else
      document.querySelector("#result").innerHTML =
        "No, user is not yet logged in!";
  } catch (e) {
    console.log(e);
  }
}

async function canReconnect() {
  try {
    let ans = await auth.canReconnect();
    if (true === ans)
      document.querySelector("#result").innerHTML = "Yes, can reconnect!";
    else document.querySelector("#result").innerHTML = "No, cannot reconnect!";
  } catch (e) {
    console.log(e);
  }
}

async function reconnect() {
  try {
    const check = await auth.canReconnect();
    if (true === check) {
      console.log("Reconnecting...");
      await auth.reconnect();
      document.querySelector("#result").innerHTML = "Reconnected!";
    } else {
      document.querySelector("#result").innerHTML =
        "Cannot Reconnect, first usesr should be logged in to reconnect!";
    }
  } catch (e) {
    console.log(e);
  }
}

async function emailCallback() {
  console.log("Received emailsent callback");
  document.querySelector("#result").innerHTML =
    "Login With Link: Link Emailed!";
}

async function loginWithOTP() {
  try {
    console.log("Login OTP will be sent to:", ENV_USER_LOGIN_EMAIL);

    const login = await auth.loginWithOTPStart(ENV_USER_LOGIN_EMAIL)
    await login.begin()

    if(login.isCompleteRequired) {
      console.log("isCompleteRequired is True");
      await loginWithOTPComplete(ENV_USER_LOGIN_EMAIL, emailCallback)
    }
    document.querySelector("#result").innerHTML =
      "Login With Link: Link Emailed to emailID=", ENV_USER_LOGIN_EMAIL;
  } catch (e) {
    console.log(e);
  }
}

async function loginWithLink() {
  try {
    console.log("Login email link will be sent to:", ENV_USER_LOGIN_EMAIL);
    await auth.loginWithLink(ENV_USER_LOGIN_EMAIL, emailCallback());
    document.querySelector("#result").innerHTML =
      "Login With Link: Link Emailed to emailID=", ENV_USER_LOGIN_EMAIL;
  } catch (e) {
    console.log(e);
  }
}

async function loginWithSocial() {
  try {
    await auth.loginWithSocial(ENV_USER_LOGIN_VERIFIER);
    document.querySelector("#result").innerHTML =
      "Login With Social Provider: " +
      ENV_USER_LOGIN_VERIFIER +
      " Logged in!";
  } catch (e) {
    console.log(e);
  }
}
async function unlinkPasskey() {
  try {
    let ans = await auth.isLoggedIn();
    if (ans){
      const myKeys = await auth.getMyPasskeys();
      console.log("My Passkeys:", myKeys)
      document.querySelector("#result").innerHTML =
      "You will be Unlinking Passkey[0]: " +
      myKeys[0];
      await auth.unlinkPasskey[myKeys[0]];
      console.log("Unlinked Passkey:", myKeys[0])
      document.querySelector("#result").innerHTML =
      "Unlinked Passkey[0]: " +
      myKeys[0];   
      isPasskeySet = false;
      // Hide the login with Passkey option now that they are unlinked
      showPasskeyLogin.style.display = "none";
    } else console.log("User must be logged in to unlink passkey!!!");
  } catch (e) {
    console.log(e);
  }
}

async function setPasskey() {
  try {
    let ans = await auth.isLoggedIn();
    if (ans) {
      if (!isPasskeySet) {
        await auth.linkPasskey();
        document.querySelector("#result").innerHTML =
          "Linked Passkey for the current user. ";
        isPasskeySet = true;
        // Display login with Passkey now that they are set
        const showPasskeyLogin = document.getElementById("Btn-Login-with-Passkey");
        showPasskeyLogin.style.display = "block";
        console.log("Login with Passkey enabled in UI now!!!")
      } else console.log("Passkey already linked for this app. You can unlink and set again.");
    } else console.log("User must be logged in to set passkey!!!");
  } catch (e) {
    console.log(e);
  }
}

async function loginWithPasskey() {
  try {
    let sup = await auth.isPasskeyLoginSupported();
    if (sup){
      let ans = await auth.isLoggedIn();
      if (!ans){
        await auth.loginWithPasskey();
        const userInfo = await auth.getUser();
        console.log({ userInfo });
        document.querySelector("#result").innerHTML =
          "Login With Passkey: " +
          userInfo.id.toString() +
          " Logged in with Passkey!";
      } else console.log("User already logged in!");
    } else console.log("Login via Passkey not supported on this device/browser.")
  } catch (e) {
    console.log(e);
  }
}

async function requestAccounts() {
  console.log("Requesting accounts");
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    console.log({ accounts });
    document.querySelector("#result").innerHTML =
      "RequestAccounts: " + JSON.stringify(accounts);
    console.log({ e });
  } catch (e) {
    console.log({ e });
  }
}

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

async function getAccounts() {
  console.log("Requesting accounts");
  try {
    const accounts = await auth.provider.request({ method: "eth_accounts" });
    console.log({ accounts });
    from = accounts[0];
    document.querySelector("#result").innerHTML = accounts[0];
  } catch (e) {
    console.log(e);
  }
}

async function getUser() {
  console.log("Get User Information...");
  try {
    const userInfo = await auth.getUser();
    console.log({ userInfo });
    document.querySelector("#result").innerHTML =
      "Email: " +
      userInfo.email.toString() +
      "," +
      "Name: " +
      userInfo.id.toString() +
      "," +
      "Login Type: " +
      userInfo.loginType.toString() +
      "," +
      "Public Key: " +
      userInfo.publicKey.toString() +
      "," +
      "Arcana JWT Token: " +
      userInfo.loginToken.toString();
  } catch (e) {
    console.log(e);
  }
}

async function getPublicKey() {
  console.log("Get User's Public Key...");
  try {
    const pKey = await auth.getPublicKey(
      ENV_USER_LOGIN_EMAIL,
      ENV_USER_LOGIN_VERIFIER
    );
    console.log(pKey.toString());
    document.querySelector("#result").innerHTML = pKey.toString();
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
          chainId: ENV_ADD_CHAIN_ID,
          chainName: ENV_ADD_CHAIN_NAME,
          blockExplorerUrls: [ENV_ADD_CHAIN_BLK_EXP_URL],
          rpcUrls: [ENV_ADD_CHAIN_RPC_URL],
          nativeCurrency: {
            symbol: ENV_ADD_CHAIN_SYM
          }
        }
      ]
    });
    document.querySelector("#result").innerHTML = "Chain added successfully!";
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
          chainId: ENV_SWITCH_CHAIN_ID
        }
      ]
    });
    document.querySelector("#result").innerHTML =
      "Switched to the chain id" +
      ENV_SWITCH_CHAIN_ID +
      " successfully!";
  } catch (e) {
    console.log({ e });
  }
}

let contractAddress;

async function addToken() {
  try {
    await auth.provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: "1"
        }
      ]
    });
    document.querySelector("#result").innerHTML =
      "Switched to the chain id 1: Ethereum successfully before adding token on Ethereum!";
    const response = await auth.provider.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address:
            //contractAddress || "0xdf0316fa1732ffa7ccddcf1dd31b0503face4c97", //Fantom Testnet SHETH ERC20
            //symbol: "XETH",
            contractAddress || "0xB983E01458529665007fF7E0CDdeCDB74B967Eb6",
          symbol: "FOO",
          decimals: 18
        }
      }
    });
    document.querySelector("#result").innerHTML =
      "Tokens Added successfully!" + response;
  } catch (e) {
    console.log({ e });
  }
}

/* send_transaction */
//2 WEI 2000000000000000000 = 1BC16D674EC80000 hex value
async function sendTransaction() {
  try {
    const hash = await auth.provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          gasPrice: 0,
          to: "0xbd1127C076c91274B9Ccd6c506817D364bc7ff80",
          //value: '0x0de0b6b3a7640000',
          value: "0x1BC16D674EC80000"
        }
      ]
    });
    console.log({ hash });
    document.querySelector("#result").innerHTML =
      "eth_sendTransaction to wallet 0xbd1127C076c91274B9Ccd6c506817D364bc7ff80 success, hash = " +
      hash;
  } catch (e) {
    console.log({ e });
    document.querySelector("#result").innerHTML =
      "eth_sendTransaction to wallet 0xbd1127C076c91274B9Ccd6c506817D364bc7ff80 failed, error = " +
      e;
  }
}

async function ethContractDeploy() {
  console.log("Requesting Contract Deployment");
  bytecode = await import('./jmtk-erc20-bc.json');
  abi = await import('./jmtk-erc20-abi.json');
  const myProvider = new ethers.providers.Web3Provider(auth.getProvider());
  const signer = await myProvider.getSigner();

  /* Now create a contract via factory */
  const myContract = new ethers.ContractFactory(abi, bytecode, signer);

  /* Now deploy the contract*/

  const contract = await myContract.deploy("0x19Db25F1d1e857F0b17C56a1A7A7d8C9fe09Ee17");
  console.log("contract deployed at address:", contract.address());

  document.querySelector("#result").innerHTML =
    "Contract Deployment Transaction successful!" + address;
}

/*eth_signTransaction is not recommended*/
/*
async function ethSign() {
  console.log("Requesting signature");
  const signature = await provider.request({
    method: "eth_sign",
    params: [from, "some_random_data"]
  });
  document.querySelector("#result").innerHTML =
    "eth_sign Transaction successful!" + signature;
  console.log({ signature });
}
*/
async function pSign() {
  const exampleMessage = "This is an example of `personal_sign` message.";
  const psignmsg = `0x${Buffer.from(exampleMessage, "utf8").toString("hex")}`;
  console.log("Requesting personal signature");
  try {
    const personalSign = await provider.request({
      method: "personal_sign",
      //params: ["0", from]
      params: [psignmsg, from]
    });

    document.querySelector("#result").innerHTML =
      "Personal Sign Transaction successful!" + personalSign;
    console.log({ personalSign });
  } catch (e) {
    console.log({ e });
    document.querySelector("#result").innerHTML =
      "Personal Sign Transaction failed!!!" + e;
  }
}

// Get Public Key
// associated with the current account
// and  used for encryption

async function getEncryptPK() {
  console.log("Requesting logged in user's public key");
  try {
    const pk = await auth.provider.request({
      method: "eth_getEncryptionPublicKey",
      params: [from]
    });
    console.log({ pk });
    document.querySelector("#result").innerHTML =
      "Logged in User's Public Key =" + pk;
  } catch (e) {
    console.log({ e });
    document.querySelector("#result").innerHTML =
      "eth_getEncryptionPublicKey failed!!! error = " + e;
  }
}

async function getUserPK() {
  console.log(
    "Requesting public for user with email id:",
    ENV_QUERY_PUBLIC_KEY_FOR_ID
  );
  try {
    userPK = await auth.provider.getPublicKey(
      ENV_QUERY_PUBLIC_KEY_FOR_ID,
      ENV_QUERY_PUBLIC_KEY_FOR_ID_VERIFIER
    );
    console.log({ userPK });
    document.querySelector("#result").innerHTML =
      "Public key for input email ID = " +
     ENV_QUERY_PUBLIC_KEY_FOR_ID +
      " is" +
      userPK;
  } catch (e) {
    console.log({ e });
    document.querySelector("#result").innerHTML =
      "Public key for input email ID failed with error =  " + e;
  }
}

async function showWallet() {
  console.log("Display wallet...");
  try {
    await auth.showWallet();
    document.querySelector("#result").innerHTML =
      "Wallet displayed on the " +
      ENV_ARCANA_WALLET_UI_POSITION +
      " side of the screen.";
  } catch (e) {
    console.log({ e });
  }
}

/* Typed Sign v4 msgParams */
/* Ref: https://docs.metamask.io/wallet/how-to/sign-data/ */

// eth_signTypedData_v4 parameters. All of these parameters affect the resulting signature.
const msgParams = JSON.stringify({
  domain: {
    // This defines the network, in this case, Mainnet.
    chainId: 1,
    // Give a user-friendly name to the specific contract you're signing for.
    name: "Ether Mail",
    // Add a verifying contract to make sure you're establishing contracts with the proper entity.
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    // This identifies the latest version.
    version: "1"
  },

  // This defines the message you're proposing the user to sign, is dapp-specific, and contains
  // anything you want. There are no required fields. Be as explicit as possible when building out
  // the message schema.
  message: {
    contents: "Hello, Bob!",
    attachedMoneyInEth: 4.2,
    from: {
      name: "Cow",
      wallets: [
        "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF"
      ]
    },
    to: [
      {
        name: "Bob",
        wallets: [
          "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
          "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
          "0xB0B0b0b0b0b0B000000000000000000000000000"
        ]
      }
    ]
  },
  // This refers to the keys of the following types object.
  primaryType: "Mail",
  types: {
    // This refers to the domain the contract is hosted on.
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ],
    // Not an EIP712Domain definition.
    Group: [
      { name: "name", type: "string" },
      { name: "members", type: "Person[]" }
    ],
    // Refer to primaryType.
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person[]" },
      { name: "contents", type: "string" }
    ],
    // Not an EIP712Domain definition.
    Person: [
      { name: "name", type: "string" },
      { name: "wallets", type: "address[]" }
    ]
  }
});

async function typedSignv4() {
  console.log("Requesting typed signature");
  try {
    /* Change chain to ethereum for this request*/
    await auth.provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: "1"
        }
      ]
    });
    document.querySelector("#result").innerHTML =
      "Switched to the chain id 1: Ethereum successfully before performing typedSignv4 on Ethereum!";

    const typedSign = await auth.provider.request({
      method: "eth_signTypedData_v4",
      params: [from, msgParams]
    });
    document.querySelector("#result").innerHTML =
      "TypedSignv4 success =" + typedSign;
    console.log({ typedSign });
  } catch (e) {
    console.log({ e });
    document.querySelector("#result").innerHTML =
      "TypedSignv4 failed with error = " + e;
  }
}

document.querySelector("#Btn-InitAuth").addEventListener("click", initAuth);
document.querySelector("#Btn-GetLogins").addEventListener("click", getLogins);
document.querySelector("#Btn-GetAppId").addEventListener("click", getAppId);
document.querySelector("#Btn-GetTheme").addEventListener("click", getTheme);
document.querySelector("#Btn-GetLogo").addEventListener("click", getLogo);
document.querySelector("#Btn-IsLoggedIn").addEventListener("click", isLoggedIn);
document
  .querySelector("#Btn-CanReConnect")
  .addEventListener("click", canReconnect);
document.querySelector("#Btn-Reconnect").addEventListener("click", reconnect);
document.querySelector("#Btn-Connect").addEventListener("click", connect);
document
  .querySelector("#Btn-SetPasskey")
  .addEventListener("click", setPasskey);
  document
  .querySelector("#Btn-UnlinkPasskey")
  .addEventListener("click", unlinkPasskey);
document
  .querySelector("#Btn-Login-with-Passkey")
  .addEventListener("click", loginWithPasskey);
document
  .querySelector("#Btn-Login-with-Social")
  .addEventListener("click", loginWithSocial);
document
  .querySelector("#Btn-Login-with-Link")
  .addEventListener("click", loginWithLink);
document
  .querySelector("#Btn-Login-with-OTP")
  .addEventListener("click", loginWithOTP);
document
  .querySelector("#Btn-GetAccounts")
  .addEventListener("click", getAccounts);
document.querySelector("#Btn-GetUser").addEventListener("click", getUser);
document
  .querySelector("#Btn-GetPublicKey")
  .addEventListener("click", getPublicKey);
document
  .querySelector("#Btn-GetEncryptPublicKey")
  .addEventListener("click", getEncryptPK);
document
  .querySelector("#Btn-GetUserPublicKey")
  .addEventListener("click", getUserPK);
document
  .querySelector("#Btn-ReqAccounts")
  .addEventListener("click", requestAccounts);
document.querySelector("#Btn-AddChain").addEventListener("click", addChain);
document
  .querySelector("#Btn-SwitchChain")
  .addEventListener("click", switchChain);
document.querySelector("#Btn-ShowWallet").addEventListener("click", showWallet);
document.querySelector("#Btn-AddToken").addEventListener("click", addToken);
document.querySelector("#Btn-PSign").addEventListener("click", pSign);
document
  .querySelector("#Btn-TypedSignv4")
  .addEventListener("click", typedSignv4);
document
  .querySelector("#Btn-Contract")
  .addEventListener("click", ethContractDeploy);
/*
document.querySelector("#Btn-EthSign").addEventListener("click", ethSign);
*/
document.querySelector("#Btn-Logout").addEventListener("click", logout);
const showPasskeyLogin = document.getElementById("Btn-Login-with-Passkey");
showPasskeyLogin.style.display = "none";