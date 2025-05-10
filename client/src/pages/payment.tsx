import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, Copy } from "lucide-react";
import { NotificationController } from "@/components/ui/notification";
import { Loader } from "@/components/ui/loader";
import { apiRequest } from "@/lib/queryClient";
import { getItem, saveAuthState } from "@/lib/localStorage";
import { ProgressSteps } from "@/components/ui/progress-steps";

export default function Payment() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  // Wallet address
  const walletAddress = "terra10dmrdzmc8u47v3c6ekh50h6ftn247qxnl2zwd9";
  
  useEffect(() => {
    // Get username from localStorage
    const savedUsername = getItem<string>("lunaflix_username");
    if (!savedUsername) {
      // If no username is found, redirect to login
      navigate("/");
      return;
    }
    
    setUsername(savedUsername);
  }, [navigate]);

  // Copy wallet address to clipboard
  const copyToClipboard = async (text: string, showNotification: Function) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification("success", "Disalin", "Alamat wallet telah disalin ke clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      showNotification("error", "Gagal", "Tidak dapat menyalin ke clipboard");
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirmation = async (showNotification: Function) => {
    if (!username) return;
    
    try {
      setIsLoading(true);
      
      // Send payment verification request to server
      const response = await apiRequest("POST", "/api/payment/verify", {
        username,
        amount: 5000,
        wallet: walletAddress,
      });
      
      if (response.ok) {
        // Save authentication state
        saveAuthState(username);
        
        // Show success notification
        showNotification("success", "Pembayaran Berhasil", "Selamat menikmati konten premium!");
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      showNotification("error", "Verifikasi Gagal", "Pastikan Anda telah mengirim LUNC ke wallet yang ditentukan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotificationController>
      {({ showNotification }) => (
        <div className="flex-1 flex flex-col min-h-screen bg-netflix-black">
          {isLoading && <Loader text="Memverifikasi pembayaran..." />}
          
          {/* Netflix-inspired header */}
          <header className="w-full p-4 flex items-center">
            <h1 className="text-primary font-extrabold text-4xl tracking-tighter">LUNAFLIX</h1>
          </header>
          
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-netflix-dark-gray rounded-md border-0 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-8 text-white">
                <h1 className="text-3xl font-bold mb-3">Pembayaran</h1>
                <p className="text-gray-300 text-sm">Station Wallet LUNC</p>
              </div>
              
              {/* Content */}
              <CardContent className="p-6">
                <div className="mb-6 border border-gray-700 rounded-lg p-4 bg-netflix-gray">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Total Pembayaran</span>
                    <span className="font-semibold text-white">5,000 LUNC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Akses</span>
                    <span className="font-semibold text-white">30 Hari</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Wallet Tujuan
                    </label>
                    <div className="flex items-center">
                      <Input
                        value={walletAddress}
                        className="bg-netflix-gray text-white border-gray-600 focus:border-gray-400 cursor-not-allowed"
                        readOnly
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        className="ml-2 text-primary border-primary hover:bg-primary/10"
                        onClick={() => copyToClipboard(walletAddress, showNotification)}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Salin alamat wallet ke Station Wallet
                    </p>
                  </div>
                  
                  <div className="border-t border-b border-gray-700 py-6">
                    <p className="text-gray-300 mb-4">Langkah Pembayaran:</p>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-400">
                      <li>Buka aplikasi Station Wallet Anda</li>
                      <li>Kirim <span className="font-medium text-white">5,000 LUNC</span> ke alamat wallet di atas</li>
                      <li>Kembali ke halaman ini dan klik "Konfirmasi Pembayaran"</li>
                      <li>Tunggu proses verifikasi pembayaran selesai</li>
                    </ol>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="button"
                      className="w-full py-6 rounded-md font-medium transition duration-200"
                      onClick={() => handlePaymentConfirmation(showNotification)}
                    >
                      Konfirmasi Pembayaran
                    </Button>
                  </div>
                  
                  <div className="mt-8 mb-4">
                    <ProgressSteps 
                      currentStep={3} 
                      totalSteps={3} 
                      labels={["Login", "Verifikasi", "Pembayaran"]} 
                    />
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="ghost"
                      className="text-gray-300 hover:text-white"
                      onClick={() => navigate("/verification")}
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-1" /> Kembali
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </NotificationController>
  );
}
