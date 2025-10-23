// Function to handle file uploads
export const uploadFile = async (file) => {
  // Convert file to base64 for Airtable
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({
      url: reader.result,
      filename: file.name,
      type: file.type
    });
    reader.onerror = error => reject(error);
  });
};

// Function to submit form data to Airtable via API route (SECURE)
export const submitToAirtable = async (formData) => {
  try {
    // Prepare files for upload
    const fileFields = ['logo', 'businessCard', 'rollup', 'hoodie', 'socialMediaBanner', 'emailSignature', 'wallpaper', 'pitchDeck', 'openGraphImage', 'favicon'];
    const filesToUpload = {};
    
    for (const field of fileFields) {
      if (formData[field] && formData[field] instanceof File) {
        filesToUpload[field] = await uploadFile(formData[field]);
      }
    }

    // Prepare the data for Airtable
    const dataToSubmit = {
      ...formData,
      ...filesToUpload
    };

    // Submit to our secure API route instead of directly to Airtable
    // This keeps the Airtable API key secure on the server
    const response = await fetch('/api/airtable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSubmit)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting to Airtable:', error);
    throw error;
  }
};
