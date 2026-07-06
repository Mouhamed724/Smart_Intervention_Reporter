import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function NoteVocale({ interventionId }) {
  const [langue, setLangue] = useState('fr');
  const [fichier, setFichier] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => { setFichier(e.target.files[0]); setError(''); setSuccess(''); };

  const handleTranscrire = async () => {
    if (!fichier) return setError("Veuillez sélectionner un audio.");
    setIsUploading(true); setError(''); setSuccess('');
    const formData = new FormData();
    formData.append('audio', fichier);
    formData.append('langue', langue);
    try {
      const response = await axios.post(`${API}/notes-vocales/${interventionId}`, formData);
      setTranscription(response.data.texte);
      setSuccess("Transcription générée avec succès. Relisez le texte ci-dessous.");
    } catch (err) { 
      setError("Erreur de transcription. Vérifiez la connexion au serveur."); 
    } finally { setIsUploading(false); }
  };

  const handleValider = async () => {
    try {
      await axios.put(`${API}/notes-vocales/valider/${interventionId}`, { nouveauTexte: transcription });
      setIsValidated(true);
      setSuccess("Note vocale validée et verrouillée.");
    } catch (err) { setError("Erreur lors de la validation."); }
  };

  return (
    <div className="mt-4">
      {error && <p className="text-red-500 text-sm mb-2 bg-red-50 p-2 rounded">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-2 bg-green-50 p-2 rounded">{success}</p>}
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="file" accept="audio/*" capture="microphone" onChange={handleFileChange} className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={isValidated} />
        <select value={langue} onChange={(e) => setLangue(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" disabled={isValidated}>
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 Anglais</option>
        </select>
        <button onClick={handleTranscrire} disabled={isUploading || !fichier || isValidated} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium transition">
          {isUploading ? 'Analyse...' : 'Transcrire'}
        </button>
      </div>

      {transcription && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Relisez et corrigez si besoin :</label>
          <textarea value={transcription} onChange={(e) => setTranscription(e.target.value)} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" disabled={isValidated} />
          
          {!isValidated ? (
            <button onClick={handleValider} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
              ✅ Valider définitivement
            </button>
          ) : (
            <p className="mt-2 text-green-600 font-semibold text-sm">✅ Transcription verrouillée.</p>
          )}
        </div>
      )}
    </div>
  );
}