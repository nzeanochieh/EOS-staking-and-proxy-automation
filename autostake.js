//EOS Actions
const {
    Api,
    JsonRpc,
    RpcError
} = require('eosjs');
const {
    JsSignatureProvider
} = require('eosjs/dist/eosjs-jssig'); // development only
const fetch = require('node-fetch'); // node only; not needed in browsers
const {
    TextEncoder,
    TextDecoder
} = require('util'); // node only; native TextEncoder/Decoder

//const tsuiMLTPK = "5KXcxaHWzW3M2N6oXM8er9wLhdZ7wTqpJPdE77n4TNri3696fSR"; // bob
//const signatureProvider = new JsSignatureProvider([tsuiMLTPK]);


const rpc = new JsonRpc('https://api.eospglmlt.com/', {
    fetch
});
//const apiEOS = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const allPK = [ "", "",""];
const allAcct = ["", "",""];




async function getAccountBalance(accountName) {
    const tokenSymbol = 'EOS';
    try {
        const account = await rpc.get_account(accountName);
        const balance = account.core_liquid_balance;
        if (balance) {
            console.log(balance)
            const [amount, symbol] = balance.split(' ');
            if (symbol === tokenSymbol) {
                console.log( symbol);
                return amount;
            }
        }
        return 0;
    } catch (error) {
        console.error(error);
        return 0;
    }
}


async function proxy(account, pk) {

    const signatureProvider = new JsSignatureProvider([pk]);

    const api = new Api({
        rpc,
        signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder()
    });

    const result = await api.transact({
        actions: [

            {
                account: 'eosio',
                name: 'voteproducer',
                authorization: [{
                    actor: account,
                    permission: 'voting',
                }],
                data: {
                    producers: [],
                    proxy: 'newdexproxy4',
                    voter: account,
                },
            }
        ]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
    });
    console.dir(result);

}


async function staketorex(quantity, account, pk) {

    const signatureProvider = new JsSignatureProvider([pk]);

    //    console.log(amount);
    const api = new Api({
        rpc,
        signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder()
    });

    const result = await api.transact({
        actions: [

           
            {
                account: 'eosio',
                name: 'deposit',
                authorization: [{
                    actor: account,
                    permission: 'voting',
                }],
                data: {
                    amount: quantity,
                    owner: account,

                },
            },
            {
                account: 'eosio',
                name: 'buyrex',
                authorization: [{
                    actor: account,
                    permission: 'voting',
                }],
                data: {
                    amount: quantity,
                    from: account,

                },
            },


        ]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
    });
    console.dir(result);

}



/*async function getReward(account) {
    let response = await (await hyperion.getTransfers("eosio.token", account, last)).json();



}*/

//https://api.eospglmlt.com
//https://eos.eosusa.io/v2/history

// Function to perform the action you want
 async function performAction() {
   function HyperionManager() {
    const hyperion_url = "https://eos.eosusa.io/v2/history";

    this.getTransfers = async function(token_contract, to, after = "") {
        return await fetch(hyperion_url + "/get_actions?account=" + token_contract + "&transfer.to=" + to + "&limit=1000" + (after === "" ? "" : `&after=${after}`));
    }
    /*this.getTransfers = async function(token_contract, to, before = "") {
        const url = `${hyperion_url}/get_actions?account=${token_contract}&transfer.to=${to}&limit=1000${before === "" ? "" : `&before=${before}`}`;
        return await fetch(url);
    }*/
    
}

const date = new Date();
const currentDate = new Date(date.getTime() - (24 * 60 * 60 * 1000));
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to get a 1-based month
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');
const seconds = String(currentDate.getSeconds()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
console.log(formattedDate); 




for (let a = 0; a<allAcct.length; a++) {    

    try{
    
        let hyperion = new HyperionManager();

        let response = await (await hyperion.getTransfers("eosio.token", allAcct[a], formattedDate)).json();

        for (let i=0; i< response.actions.length; i++){
        const sender = await response.actions[i].act.data.from;
       if (sender === 'newposincome') {
       console.log(response.actions[i].act.data);
       await staketorex(response.actions[i].act.data.quantity, allAcct[a], allPK[a]);
       await proxy(allAcct[a], allPK[a]);
              }
   }

   }catch (error){
    console.error(`Error on ${allAcct[a]} account says: ${error.message}`);
    
             }
                  }
    
}

  







async function main() {
    // for (i in allAcct){
    //    const balance = await getAccountBalance(allAcct[i]);
    //    stake(balance, allAcct[i], allPK[i])
    //
    // }

   getAccountBalance("alejandateos") 
   performAction();
      
    //staketorex(0.0001, allAcct[0], allPK[0]);
    

}

main();




// Call the function
//getAccountBalance(accountName, tokenSymbol).then((balance) => {
//  console.log(`Account balance: ${balance} ${tokenSymbol}`);
//});


