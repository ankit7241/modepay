import React, { useEffect, useState } from "react";
import { useContractWrite, useContractRead } from "wagmi";
import { CONTRACT_ADDRESS } from "../../data/contractDetails";
import { ABI } from "../../data/contractDetails";
import sendMessage from "../../utils/sendMessage";
import { ethers } from "ethers";

export default function CreateSplitModal({
	visible,
	onClose,
	chatId,
	members,
	toggleRefreshCallback,
}: {
	visible: boolean;
	onClose: any;
	chatId: any;
	members: string[] | null;
	toggleRefreshCallback: () => void;
}) {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [splitCount, setSplitCount] = useState();
	const [refreshSplitCount, setRefreshSplitCount] = useState(true);

	const { write } = useContractWrite({
		address: CONTRACT_ADDRESS,
		abi: ABI,
		functionName: "createSplit",
		async onSuccess(data) {
			console.log("Success", data);

			await sendMessage(chatId, `**$$**${splitCount}`);
			toggleRefreshCallback();
			setRefreshSplitCount(!refreshSplitCount);
			onClose();
		},
	});

	function handleAmountChange(event: any) {
		console.log(event.target.value);
		setAmount(event.target.value);
	}

	function handleReasonChange(event: any) {
		console.log(event.target.value);
		setReason(event.target.value);
	}

	function handleOnClose(e: any) {
		if (e.target.id == "container") onClose();
	}

	if (!visible) return null;

	async function createSplit() {
		try {
			const { ethereum }: any = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					ABI,
					signer
				);

				console.log("members : ", members);
				console.log(parseInt(chatId), amount, reason, members);
				write({
					args: [parseInt(chatId), amount, reason, members],
				});

				let splits;

				await connectedContract
					.getSplitCount(`${parseInt(chatId)}`)
					.then((result: any) => {
						splits = `${result}`;
					});

				console.log(splits);

				setSplitCount(splits);
			}
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div
			id="container"
			className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
			onClick={handleOnClose}
		>
			<div className="bg-white p-8 rounded-md shadow-md w-96">
				<h2 className="text-xl font-bold mb-4">Split Payment</h2>

				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2">
						Amount
					</label>
					<input
						type="text"
						value={amount}
						onChange={handleAmountChange}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2">
						Reason
					</label>
					<textarea
						value={reason}
						onChange={handleReasonChange}
						className="w-full h-20 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring focus:border-blue-300"
					/>
				</div>

				<button
					onClick={createSplit}
					className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
				>
					Split
				</button>
			</div>
		</div>
	);
}
