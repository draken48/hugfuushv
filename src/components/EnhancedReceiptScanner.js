import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertCircle, X, Loader, Image as ImageIcon, Zap } from 'lucide-react';

const EnhancedReceiptScanner = ({ onExpenseExtracted, categories, darkMode, cardBg, borderColor }) => {
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Simulate OCR extraction (In production, use Tesseract.js or cloud OCR API)
  const performOCR = async (imageFile) => {
    setProcessing(true);
    setError(null);

    try {
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFile);

      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, you would use:
      // 1. Tesseract.js for client-side OCR:
      //    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
      // 
      // 2. Or Google Cloud Vision API:
      //    const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {...});
      //
      // 3. Or AWS Textract:
      //    const result = await textract.detectDocumentText({...});

      // Simulated OCR result (in production this would be real extracted text)
      const simulatedOCRText = `
        GROCERY STORE
        123 Main Street
        City, ST 12345
        Tel: (555) 123-4567
        
        Date: ${new Date().toLocaleDateString()}
        Time: ${new Date().toLocaleTimeString()}
        
        Receipt #: ${Math.floor(Math.random() * 10000)}
        
        ITEMS:
        Organic Milk          $5.99
        Fresh Bread           $3.49
        Chicken Breast        $12.99
        Mixed Vegetables      $6.49
        Orange Juice          $4.99
        
        SUBTOTAL:            $33.95
        TAX (8%):             $2.72
        TOTAL:               $36.67
        
        PAYMENT METHOD: CREDIT CARD
        Thank you for shopping with us!
      `;

      // Parse the OCR text
      const parsedData = parseReceiptText(simulatedOCRText);
      setExtractedData(parsedData);
      setProcessing(false);

    } catch (err) {
      setError('Failed to process receipt. Please try again.');
      setProcessing(false);
      console.error('OCR Error:', err);
    }
  };

  // AI-powered receipt parsing
  const parseReceiptText = (text) => {
    // Extract merchant name (usually first line or contains "STORE", "MARKET", etc.)
    const lines = text.trim().split('\n').filter(line => line.trim());
    let merchant = lines[0] || 'Unknown Merchant';
    
    // Look for merchant keywords
    const merchantKeywords = ['STORE', 'MARKET', 'SHOP', 'CAFE', 'RESTAURANT', 'PHARMACY'];
    const merchantLine = lines.find(line => 
      merchantKeywords.some(keyword => line.toUpperCase().includes(keyword))
    );
    if (merchantLine) merchant = merchantLine.trim();

    // Extract date
    const dateRegex = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/;
    const dateMatch = text.match(dateRegex);
    const date = dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Extract total amount (look for TOTAL, AMOUNT DUE, etc.)
    const totalRegex = /(?:TOTAL|AMOUNT|BALANCE)[\s:]*\$?[\s]*([\d,]+\.?\d{0,2})/i;
    const totalMatch = text.match(totalRegex);
    const amount = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0;

    // Extract items
    const itemRegex = /([A-Za-z\s]+)\s+\$?([\d,]+\.?\d{0,2})/g;
    const items = [];
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const itemName = match[1].trim();
      const itemPrice = parseFloat(match[2].replace(/,/g, ''));
      
      // Filter out likely non-item lines (totals, dates, etc.)
      if (!itemName.match(/TOTAL|SUBTOTAL|TAX|PAYMENT|DATE|TIME|RECEIPT/i) && itemPrice > 0 && itemPrice < 1000) {
        items.push({
          name: itemName,
          price: itemPrice
        });
      }
    }

    // Auto-categorize based on merchant name and items
    const category = autoCategorizeMerchant(merchant, items);

    // Extract payment method
    const paymentRegex = /(CASH|CREDIT|DEBIT|CARD)/i;
    const paymentMatch = text.match(paymentRegex);
    const paymentMethod = paymentMatch ? paymentMatch[1] : 'Unknown';

    return {
      merchant,
      date,
      amount,
      items,
      category,
      paymentMethod,
      rawText: text
    };
  };

  // Smart categorization based on merchant and items
  const autoCategorizeMerchant = (merchant, items) => {
    const merchantLower = merchant.toLowerCase();
    const itemNames = items.map(i => i.name.toLowerCase()).join(' ');

    // Food & Dining
    if (
      merchantLower.includes('restaurant') || 
      merchantLower.includes('cafe') || 
      merchantLower.includes('pizza') ||
      merchantLower.includes('food') ||
      merchantLower.includes('market') ||
      merchantLower.includes('grocery') ||
      itemNames.includes('food') ||
      itemNames.includes('meal')
    ) {
      return 'Food & Dining';
    }

    // Transportation
    if (
      merchantLower.includes('gas') || 
      merchantLower.includes('fuel') || 
      merchantLower.includes('parking') ||
      merchantLower.includes('uber') ||
      merchantLower.includes('lyft')
    ) {
      return 'Transportation';
    }

    // Shopping
    if (
      merchantLower.includes('store') || 
      merchantLower.includes('shop') || 
      merchantLower.includes('retail') ||
      merchantLower.includes('mall')
    ) {
      return 'Shopping';
    }

    // Healthcare
    if (
      merchantLower.includes('pharmacy') || 
      merchantLower.includes('drug') || 
      merchantLower.includes('medical') ||
      merchantLower.includes('clinic')
    ) {
      return 'Healthcare';
    }

    return 'Others';
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        performOCR(file);
      } else {
        setError('Please select an image file (JPG, PNG, etc.)');
      }
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      performOCR(file);
    }
  };

  const resetScanner = () => {
    setImagePreview(null);
    setExtractedData(null);
    setError(null);
    setProcessing(false);
  };

  const confirmAndAdd = () => {
    if (extractedData && onExpenseExtracted) {
      onExpenseExtracted({
        amount: extractedData.amount,
        category: extractedData.category,
        description: extractedData.merchant,
        date: extractedData.date,
        tags: ['receipt', 'scanned'],
        mood: 'neutral',
        recurring: false,
        items: extractedData.items
      });
      resetScanner();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-8 h-8 text-purple-500" />
        <div>
          <h2 className="text-2xl font-bold">Receipt Scanner</h2>
          <p className="text-sm opacity-70">AI-powered OCR for automatic expense tracking</p>
        </div>
      </div>

      {/* Scanner Options */}
      {!imagePreview && !processing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Capture */}
          <div 
            onClick={() => cameraInputRef.current?.click()}
            className={`${cardBg} p-8 rounded-xl shadow-lg border-2 border-dashed ${borderColor} cursor-pointer hover:border-purple-500 transition-all hover:scale-105`}
          >
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h3 className="font-semibold text-lg mb-2">Take Photo</h3>
              <p className="text-sm opacity-70">Use your camera to snap a receipt</p>
            </div>
          </div>

          {/* File Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`${cardBg} p-8 rounded-xl shadow-lg border-2 border-dashed ${borderColor} cursor-pointer hover:border-blue-500 transition-all hover:scale-105`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold text-lg mb-2">Upload Image</h3>
              <p className="text-sm opacity-70">Select a receipt photo from your device</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {processing && (
        <div className={`${cardBg} p-12 rounded-xl shadow-lg border ${borderColor} text-center`}>
          <Loader className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
          <h3 className="text-xl font-bold mb-2">Scanning Receipt...</h3>
          <p className="opacity-70">AI is extracting data from your receipt</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm opacity-70">
              <Scan className="w-4 h-4 animate-pulse" />
              <span>Analyzing image quality...</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm opacity-70">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Extracting text with OCR...</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm opacity-70">
              <CheckCircle className="w-4 h-4 animate-pulse" />
              <span>Parsing receipt data...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-500'} border-l-4 p-4 rounded`}>
          <div className="flex items-start gap-2">
            <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-300' : 'text-red-500'} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`font-semibold ${darkMode ? 'text-red-200' : 'text-red-700'}`}>Error</p>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
            </div>
            <button onClick={resetScanner} className="p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {imagePreview && extractedData && !processing && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Receipt Scanned Successfully!
            </h3>
            <button onClick={resetScanner} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div>
              <p className="text-sm font-semibold mb-2">Receipt Image:</p>
              <img 
                src={imagePreview} 
                alt="Receipt" 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700"
              />
            </div>

            {/* Extracted Data */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Extracted Information:</p>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs opacity-70">Merchant</p>
                    <p className="font-semibold">{extractedData.merchant}</p>
                  </div>

                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs opacity-70">Date</p>
                    <p className="font-semibold">{new Date(extractedData.date).toLocaleDateString()}</p>
                  </div>

                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs opacity-70">Total Amount</p>
                    <p className="font-semibold text-2xl text-green-600">${extractedData.amount.toFixed(2)}</p>
                  </div>

                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs opacity-70">Category (AI Detected)</p>
                    <select
                      value={extractedData.category}
                      onChange={(e) => setExtractedData({...extractedData, category: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${borderColor} ${cardBg} mt-1 font-semibold`}
                    >
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs opacity-70">Payment Method</p>
                    <p className="font-semibold">{extractedData.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {extractedData.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Items ({extractedData.items.length}):</p>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} max-h-40 overflow-y-auto`}>
                    {extractedData.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={confirmAndAdd}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Add Expense
                </button>
                <button
                  onClick={resetScanner}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} bg-gradient-to-br from-purple-500/10 to-pink-500/10`}>
        <h3 className="text-lg font-bold mb-4">📸 How Receipt Scanner Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-2">1. Capture or Upload:</p>
            <ul className="space-y-1 opacity-70">
              <li>• Take a photo with your camera</li>
              <li>• Or upload an existing receipt image</li>
              <li>• Supports JPG, PNG, and other formats</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">2. AI Processing:</p>
            <ul className="space-y-1 opacity-70">
              <li>• OCR extracts text from image</li>
              <li>• AI identifies merchant, date, amount</li>
              <li>• Automatically categorizes expense</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">3. Review & Edit:</p>
            <ul className="space-y-1 opacity-70">
              <li>• Check extracted information</li>
              <li>• Edit any incorrect details</li>
              <li>• Change category if needed</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">4. Add to Expenses:</p>
            <ul className="space-y-1 opacity-70">
              <li>• One click to add expense</li>
              <li>• All data automatically filled</li>
              <li>• Receipt saved with expense</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips for Best Results */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">💡 Tips for Best Scanning Results</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>Good Lighting:</strong> Ensure receipt is well-lit and readable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>Flat Surface:</strong> Place receipt on a flat surface to avoid creases</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>Full Receipt:</strong> Capture the entire receipt including top and bottom</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>Clear Text:</strong> Make sure all text is visible and not faded</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>No Glare:</strong> Avoid flash reflection on glossy receipts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <span><strong>Avoid:</strong> Blurry images, poor lighting, wrinkled receipts</span>
          </li>
        </ul>
      </div>

      {/* Production Implementation Note */}
      <div className={`${cardBg} p-4 rounded-lg border ${borderColor} text-xs opacity-70`}>
        <p className="font-semibold mb-2">🔧 For Production Implementation:</p>
        <p>This demo uses simulated OCR. For real implementation, integrate:</p>
        <ul className="mt-2 space-y-1 ml-4">
          <li>• <strong>Tesseract.js:</strong> Client-side OCR (npm install tesseract.js)</li>
          <li>• <strong>Google Cloud Vision API:</strong> Highly accurate cloud OCR</li>
          <li>• <strong>AWS Textract:</strong> Enterprise-grade document analysis</li>
          <li>• <strong>Azure Computer Vision:</strong> Microsoft's OCR service</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedReceiptScanner;
