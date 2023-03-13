// this is based on Duartefdias' vue template work https://gist.github.com/duartefdias/95f3808eb05e60c2426aa9fd7423cc24
// thanks man!




// document.addEventListener('alpine:init', () => {
//     console.log('alpine:init');
Alpine.store('connected', false);
Alpine.store('checkoutStep', false);
Alpine.store('processingPayment', false);
Alpine.store('paymentCompleted', false);
Alpine.store('paymentFailed', false);
Alpine.store('updateModal', 0);
Alpine.store('buyerAddress', '');
Alpine.store('buyerEmail', '');
const sellerAddress = '0x983907410272C502Fdb12506D313f6DDabDc3C6F'; // SELLER ADDRESS (kkonrad.eth 0x983907410272C502Fdb12506D313f6DDabDc3C6F)
Alpine.store("sellerAddress", sellerAddress);
const itemPrice = 0.1;
Alpine.store("itemPrice", itemPrice);
const itemPriceInWei = "100000000"; // eth itemPrice in wei 
Alpine.store("itemPriceInWei", itemPriceInWei);
// })


checkIfWalletConnected();

function checkIfWalletConnected() {
    if (window.ethereum.request({ method: 'eth_accounts' }).then(function (accounts) {
        console.log(accounts);
        if (accounts.length > 0) {
            Alpine.store('connected', true);
            Alpine.store('buyerAddress', accounts[0]);
        } else {
            Alpine.store('connected', false);
        }
    })
    ) {
        Alpine.store('connected', true);
    } else {
        Alpine.store('connected', false);
    }
}

// Function to check if blockchain wallet is connected
function checkWalletConnected() {
    if (window.ethereum) {
        console.log('MetaMask is installed');
        window.web3 = new Web3(window.ethereum);
        window.ethereum.send('eth_requestAccounts').then(function () {
            // Get account address
            window.ethereum.request({ method: 'eth_accounts' })
                .then(function (accounts) {
                    if (accounts.length > 0) {
                        var address = accounts[0];
                        Alpine.store('buyerAddress', address);
                        Alpine.store('connected', true);
                        Alpine.store('updateModal', Alpine.store('updateModal') + 1);
                    } else {
                        Alpine.store('address', '');
                    }
                });
        });
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        Alpine.store('connected', true);
        // Force update of the modal
        Alpine.store('updateModal', Alpine.store('updateModal') + 1);
    } else {
        Alpine.store('connected', false);
    }
}

function proceedToCheckout() {
    Alpine.store('checkoutStep', true);
    Alpine.store('paymentFaile', false);
    // Force update of the modal
    Alpine.store('updateModal', Alpine.store('updateModal') + 1);
}

function makePaymentRequest() {
    // Make request to create payment request
    Alpine.store('checkoutStep', false);
    Alpine.store('processingPayment', true);
    // Start wallet payment process
    window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: Alpine.store('buyerAddress'), to: sellerAddress, value: itemPriceInWei }] })
        .then(response => {
            console.log(response);
            Alpine.store('processingPayment', false);
            Alpine.store('paymentCompleted', true);
        })
        .catch(error => {
            Alpine.store('processingPayment', false);
            Alpine.store('paymentFailed', true);
        });
}
