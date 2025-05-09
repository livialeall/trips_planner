export const generateShareableLink = () => {
    const randomToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    return `${window.location.origin}/join-trip?token=${randomToken}`;
  };