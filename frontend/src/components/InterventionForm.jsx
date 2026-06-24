import { useState } from 'react';
import axios from 'axios';
import NoteVocale from './NoteVocale';
import SignatureClient from './SignatureClient';

export default function InterventionForm() {
  const [interventionId, setInterventionId] = useState(null);
  const [formData, setFormData] = useState({
    date_debut: '', date_fin: '', type_intervention: 'Climatisation',
    equipement: '', description_probleme: '', travaux_realises: '',
    recommandations: '', id_client: '1', id_site: '1', technicienIds: '1'
  });

  const [photos, setPhotos] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const filesSelected = Array.from(e.target.files);
    const newPhotos = filesSelected.map(file => ({ file, categorie: 'avant', legende: '' }));
    setPhotos([...photos, ...newPhotos]);
  };

  const updatePhotoMeta = (index, field, value) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index][field] = value;
    setPhotos(updatedPhotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.date_debut || !formData.date_fin || !formData.travaux_realises || !formData.type_intervention) {
      setError("Veuillez remplir tous les champs obligatoires marqués d'une étoile (*).");
      return;
    }
    setLoading(true);
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
    photos.forEach((p) => dataToSend.append('photos', p.file));
    dataToSend.append('photosData', JSON.stringify(photos.map(p => ({ categorie: p.categorie, legende: p.legende }))));

    try {
      const response = await axios.post('http://localhost:3000/api/interventions', dataToSend);
      setInterventionId(response.data.id); 
      alert('✅ Intervention sauvegardée avec succès !');
    } catch (err) {
      setError("Erreur lors de l'envoi des données.");
    } finally {
      setLoading(false);
    }
  };

  // Classes Tailwind réutilisables pour avoir un design uniforme
  const inputClasses = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-50 min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900">DGS Africa</h1>
        <p className="text-gray-500">Smart Intervention Reporter</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Carte 1 : Infos Générales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Informations Générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Date de début *</label>
              <input type="datetime-local" name="date_debut" value={formData.date_debut} onChange={handleChange} required className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Date de fin *</label>
              <input type="datetime-local" name="date_fin" value={formData.date_fin} onChange={handleChange} required className={inputClasses} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Type d'intervention *</label>
              <select name="type_intervention" value={formData.type_intervention} onChange={handleChange} className={inputClasses}>
                <option value="Climatisation">Climatisation</option>
                <option value="Electricité">Electricité</option>
                <option value="Plomberie">Plomberie</option>
                <option value="Maintenance générale">Maintenance générale</option>
                <option value="Travaux civils">Travaux civils</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Équipement concerné</label>
              <input type="text" name="equipement" value={formData.equipement} onChange={handleChange} className={inputClasses} />
            </div>
          </div>
        </div>

        {/* Carte 2 : Travaux */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Travaux & Diagnostic</h2>
          
          <div className="mb-4">
            <label className={labelClasses}>Description du problème</label>
            <textarea name="description_probleme" value={formData.description_probleme} onChange={handleChange} rows="3" className={inputClasses}></textarea>
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Travaux réalisés *</label>
            <textarea name="travaux_realises" value={formData.travaux_realises} onChange={handleChange} rows="3" required className={inputClasses}></textarea>
          </div>
          <div>
            <label className={labelClasses}>Recommandations</label>
            <textarea name="recommandations" value={formData.recommandations} onChange={handleChange} rows="2" className={inputClasses}></textarea>
          </div>
        </div>

        {/* Carte 3 : Photos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Photos (Avant / Pendant / Après)</h2>
          
          <div className="mt-2 flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-gray-50 relative">
            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="text-center text-gray-500">
              <p className="font-medium">Cliquez pour ajouter des photos</p>
              <p className="text-xs">PNG, JPG jusqu'à 5MB</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((p, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50 flex flex-col">
                <img src={URL.createObjectURL(p.file)} alt="preview" className="w-full h-32 object-cover rounded-md mb-2 bg-white" />
                <div className="flex gap-2 mt-auto">
                  <select value={p.categorie} onChange={(e) => updatePhotoMeta(index, 'categorie', e.target.value)} className="flex-1 text-sm border rounded p-1.5 bg-white">
                    <option value="avant">🟢 Avant</option>
                    <option value="pendant">🟡 Pendant</option>
                    <option value="apres">🔴 Après</option>
                  </select>
                  <input type="text" placeholder="Légende..." value={p.legende} onChange={(e) => updatePhotoMeta(index, 'legende', e.target.value)} className="flex-[2] text-sm border rounded p-1.5 bg-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg">
          {loading ? 'Envoi en cours...' : '1. Sauvegarder l\'intervention'}
        </button>
      </form>

      {/* --- MODULES D'ÉTAPES (N'apparaissent que si sauvegardé) --- */}
      {interventionId && (
        <div className="mt-8 space-y-8 pt-6 border-t-2 border-dashed border-gray-300">
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h2 className="text-xl font-bold text-blue-800">Intervention N°{interventionId} en cours de complétion...</h2>
            <p className="text-blue-600 text-sm">Veuillez terminer les étapes ci-dessous pour générer le rapport.</p>
          </div>

          {/* Étape 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Étape 2 : Note vocale</h2>
            <NoteVocale interventionId={interventionId} />
          </div>

          {/* Étape 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Étape 3 : Signature du client</h2>
            <SignatureClient interventionId={interventionId} />
          </div>

          {/* Étape 4 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Étape 4 : Rapport final</h2>
            <button 
              onClick={() => window.open(`http://localhost:3000/api/pdf/${interventionId}`, '_blank')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition duration-200 text-lg flex items-center justify-center gap-2"
            >
              <span>📄</span> Télécharger le Rapport PDF
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">Le PDF contiendra toutes les données, photos et la signature intégrées.</p>
          </div>

        </div>
      )}
    </div>
  );
}