import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import axios from 'axios';

export default function SignatureClient({ interventionId }) {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [isSigned, setIsSigned] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (canvasRef.current && !signaturePadRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'black'
      });
    }
  }, []);

  const clearSig = () => { if (signaturePadRef.current) { signaturePadRef.current.clear(); setError(''); } };

  const saveSig = async () => {
    if (signaturePadRef.current.isEmpty()) { setError("Veuillez faire signer le client."); return; }
    setError('');
    try {
      const imageBase64 = signaturePadRef.current.toDataURL('image/png');
      await axios.post(`http://localhost:3000/api/signatures/${interventionId}`, { image_signature: imageBase64 });
      setIsSigned(true);
      alert("✅ Signature enregistrée !");
    } catch (err) { setError("Erreur lors de l'enregistrement."); }
  };

  return (
    <div className="mt-4">
      {error && <p className="text-red-500 text-sm mb-2 bg-red-50 p-2 rounded">{error}</p>}

      {!isSigned ? (
        <div>
          <div className="border-2 border-dashed border-gray-400 rounded-lg bg-white relative" style={{ height: '200px' }}>
            <canvas ref={canvasRef} width={800} height={200} style={{ width: '100%', height: '100%', display: 'block' }} />
            <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">Signez ici</div>
          </div>
          
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={clearSig} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium border">
              Effacer
            </button>
            <button type="button" onClick={saveSig} className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-bold">
              Confirmer la signature
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-4xl">✍️</span>
          <p className="text-green-800 font-bold text-lg mt-2">Document Signé</p>
          <p className="text-green-600 text-sm">La signature a été verrouillée et horodatée avec succès.</p>
        </div>
      )}
    </div>
  );
}