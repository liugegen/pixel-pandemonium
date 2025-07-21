// src/contracts/pixelPayment.js

// Alamat contract Anda yang sudah di-deploy di Monad Testnet
export const contractAddress = "0xD32537f579f105cF9C6C31AA9e6C1AAcb2B6A015";

// ABI (Application Binary Interface) dari contract Anda.
// Anda tidak perlu mencari ini, saya sudah sediakan di sini.
export const contractABI = [
	{
		"inputs": [],
		"name": "placePixel",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "PixelPlaced",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "TICKET_PRICE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
