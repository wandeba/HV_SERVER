class QRScanner {
    constructor() {
        this.isScanning = false;
    }

    async processFuelPurchase(riderId, stationId, amount) {
        try {
            const result = await api.processFuelPurchase({
                rider_id: riderId,
                station_id: stationId,
                fuel_amount: amount,
                pos_user: 'station_attendant'
            });
            
            if (result.success) {
                this.showSuccessMessage(result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showErrorMessage(error.message);
            throw error;
        }
    }

    showSuccessMessage(transactionData) {
        const message = `
            ✅ Fuel Purchase Successful!
            
            Amount: ${transactionData.fuel_amount} UGX
            New Balance: ${transactionData.new_balance} UGX
            Transaction ID: ${transactionData.purchase_id}
        `;
        alert(message);
    }

    showErrorMessage(error) {
        alert(`❌ Transaction Failed: ${error}`);
    }

    // Simulate QR code scan (in real app, integrate with camera)
    simulateQRScan(riderId) {
        const amount = prompt('Enter fuel amount (UGX):');
        if (amount && !isNaN(amount)) {
            this.processFuelPurchase(riderId, 'STN001', parseFloat(amount));
        }
    }
}

const qrScanner = new QRScanner();
