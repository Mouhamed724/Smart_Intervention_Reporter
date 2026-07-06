import { useState } from 'react';
import axios from 'axios';
import NoteVocale from './NoteVocale';
import SignatureClient from './SignatureClient';

// On récupère l'URL du backend depuis le fichier .env
const API = import.meta.env.VITE_API_URL;

export default function InterventionForm() {
  const [interventionId, setInterventionId] = useState(null);

  const [formData, setFormData] = useState({
    date_debut: '', date_fin: '', type_intervention: 'Climatisation',
    equipement: '', description_probleme: '', travaux_realises: '',
    recommandations: '', remarques_client: '', titre_rapport: '',
    nom_client: '', contact_client: '', adresse_site: '', 
    noms_techniciens: [''] 
  });

  const [photos, setPhotos] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setSuccess(''); // Cache le message de succès si on modifie le formulaire
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTechnicienChange = (index, value) => {
    const newTechs = [...formData.noms_techniciens];
    newTechs[index] = value;
    setFormData({ ...formData, noms_techniciens: newTechs });
  };

  const addTechnicien = () => setFormData({ ...formData, noms_techniciens: [...formData.noms_techniciens, ''] });
  
  const removeTechnicien = (index) => {
    if (formData.noms_techniciens.length <= 1) return;
    setFormData({ ...formData, noms_techniciens: formData.noms_techniciens.filter((_, i) => i !== index) });
  };

  const handlePhotoChange = (e) => {
    const filesSelected = Array.from(e.target.files);
    setPhotos([...photos, ...filesSelected.map(file => ({ file, categorie: 'avant', legende: '' }))]);
  };

  const updatePhotoMeta = (index, field, value) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index][field] = value;
    setPhotos(updatedPhotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (!formData.date_debut || !formData.date_fin || !formData.travaux_realises || !formData.type_intervention || !formData.nom_client || !formData.adresse_site) {
      setError("Veuillez remplir tous les champs obligatoires (Client, Site, Dates, Travaux).");
      return;
    }

    setLoading(true);
    const dataToSend = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'noms_techniciens') {
        dataToSend.append(key, value.filter(n => n.trim() !== '').join(','));
      } else {
        dataToSend.append(key, value);
      }
    });

    photos.forEach((p) => dataToSend.append('photos', p.file));
    dataToSend.append('photosData', JSON.stringify(photos.map(p => ({ categorie: p.categorie, legende: p.legende }))));

    try {
      const response = await axios.post(`${API}/interventions`, dataToSend);
      setInterventionId(response.data.id); 
      setSuccess("L'intervention a été enregistrée avec succès. Vous pouvez continuer.");
    } catch (err) {
      setError("Une erreur est survenue lors de l'enregistrement. Vérifiez votre connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-50 min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900">DGS Africa</h1>
        <p className="text-gray-500">Smart Intervention Reporter</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Client & Site d'intervention</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Prénom et nom du client *</label>
              <input type="text" name="nom_client" value={formData.nom_client} onChange={handleChange} required className={inputClasses} placeholder="Ex: Mouhamed Lo" />
            </div>
            <div>
              <label className={labelClasses}>Téléphone client</label>
              <input type="tel" name="contact_client" value={formData.contact_client} onChange={handleChange} className={inputClasses} placeholder="+221 77 123 45 67" />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClasses}>Adresse du site *</label>
            <input type="text" name="adresse_site" value={formData.adresse_site} onChange={handleChange} required className={inputClasses} placeholder="Ex: Dakar, Plateau, Rue 123" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Détails de l'intervention</h2>
          
          <div className="mt-4">
            <label className={labelClasses}>Titre personnalisé du rapport</label>
            <input type="text" name="titre_rapport" value={formData.titre_rapport} onChange={handleChange} className={inputClasses} placeholder="Laisser vide pour : Rapport d'intervention" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <input type="text" name="equipement" value={formData.equipement} onChange={handleChange} className={inputClasses} placeholder="Référence ou description" />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClasses}>Technicien(s) assigné(s)</label>
            <div className="mt-1 space-y-2">
              {formData.noms_techniciens.map((tech, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={tech} onChange={(e) => handleTechnicienChange(index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm" placeholder={`Nom du technicien ${index + 1}`}/>
                  {formData.noms_techniciens.length > 1 && (
                    <button type="button" onClick={() => removeTechnicien(index)} className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-md transition" title="Supprimer">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addTechnicien} className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1">
              <span className="text-lg leading-none">+</span> Ajouter un autre technicien
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Travaux & Diagnostic</h2>
          <div className="mb-4">
            <label className={labelClasses}>Description du problème</label>
            <textarea name="description_probleme" value={formData.description_probleme} onChange={handleChange} rows="3" className={inputClasses} placeholder="Diagnostic initial observé sur site..."></textarea>
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Travaux réalisés *</label>
            <textarea name="travaux_realises" value={formData.travaux_realises} onChange={handleChange} rows="3" required className={inputClasses} placeholder="Description détaillée des actions effectuées..."></textarea>
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Recommandations</label>
            <textarea name="recommandations" value={formData.recommandations} onChange={handleChange} rows="2" className={inputClasses} placeholder="Conseils ou actions à prévoir..."></textarea>
          </div>
          <div>
            <label className={labelClasses}>Remarques client</label>
            <input type="text" name="remarques_client" value={formData.remarques_client} onChange={handleChange} className={inputClasses} placeholder="Remarques éventuelles du client..." />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Photos (Avant / Pendant / Après)</h2>
          <div className="mt-2 flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-gray-50 relative">
            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="text-center text-gray-500"><p className="font-medium">Cliquez pour ajouter des photos</p><p className="text-xs">PNG, JPG jusqu'à 5MB</p></div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((p, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50 flex flex-col">
                <img src={URL.createObjectURL(p.file)} alt="preview" className="w-full h-32 object-cover rounded-md mb-2 bg-white" />
                <div className="flex gap-2 mt-auto">
                  <select value={p.categorie} onChange={(e) => updatePhotoMeta(index, 'categorie', e.target.value)} className="flex-1 text-sm border rounded p-1.5 bg-white">
                    <option value="avant">🟢 Avant</option><option value="pendant">🟡 Pendant</option><option value="apres">🔴 Après</option>
                  </select>
                  <input type="text" placeholder="Légende..." value={p.legende} onChange={(e) => updatePhotoMeta(index, 'legende', e.target.value)} className="flex-[2] text-sm border rounded p-1.5 bg-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition duration-200 disabled:opacity-50 text-lg">
          {loading ? 'Envoi en cours...' : '1. Sauvegarder l\'intervention'}
        </button>
      </form>

      {interventionId && (
        <div className="mt-8 space-y-8 pt-6 border-t-2 border-dashed border-gray-300">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h2 className="text-xl font-bold text-blue-800">Intervention N°{interventionId} en cours de complétion...</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Étape 2 : Note vocale</h2>
            <NoteVocale interventionId={interventionId} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Étape 3 : Signature du client</h2>
            <SignatureClient interventionId={interventionId} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Étape 4 : Rapport final</h2>
            <button onClick={() => window.open(`${API}/pdf/${interventionId}`, '_blank')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition duration-200 text-lg flex items-center justify-center gap-2">
              <span>📄</span> Télécharger le Rapport PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}