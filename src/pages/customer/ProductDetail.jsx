import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';
import { Type, Image as ImageIcon, X } from 'lucide-react';
import api from '../../services/api';
import BackButton from '../../components/common/BackButton';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');

  const [showTextConfig, setShowTextConfig] = useState(false);
  const [showDesignConfig, setShowDesignConfig] = useState(false);

  const [customText, setCustomText] = useState('YOUR TEXT');
  const [textColour, setTextColour] = useState('#111111');
  const [textRnd, setTextRnd] = useState({ x: 100, y: 100, width: 200, height: 60 });

  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [designRnd, setDesignRnd] = useState({ x: 100, y: 200, width: 150, height: 150 });

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const printAreaRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
        
        const urlColour = new URLSearchParams(location.search).get('colour');

        if (data.availableColours?.length) {
          const matchedColour = data.availableColours.find(c => {
             const cName = typeof c === 'string' ? c : c.name;
             return cName === urlColour;
          });
          
          let initialColourObj = matchedColour || data.availableColours[0];
          let initialColourName = typeof initialColourObj === 'string' ? initialColourObj : initialColourObj.name;
          
          setSelectedColour(initialColourName);
          const firstSizes = (typeof initialColourObj === 'object' ? initialColourObj.sizes : null) || data.availableSizes || [];
          if (firstSizes.length) setSelectedSize(firstSizes[0]);
        } else if (data.availableSizes?.length) {
          setSelectedSize(data.availableSizes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchDesigns = async () => {
      try {
        const { data } = await api.get('/designs');
        setDesigns(data);
      } catch (err) {
        console.error("Failed to load designs", err);
      }
    };

    fetchProduct();
    fetchDesigns();
  }, [slug, location.search]);

  const handleAddToCart = async () => {
    setAdding(true);
    setError('');
    
    let previewUrl = '';
    
    try {

      if ((showTextConfig || showDesignConfig) && printAreaRef.current) {
        const canvas = await html2canvas(printAreaRef.current, { useCORS: true, backgroundColor: null });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        const uploadData = new FormData();
        uploadData.append('image', blob, 'preview.png');
        const uploadRes = await api.post('/upload', uploadData);
        previewUrl = uploadRes.data.url;
      }

      let customPayload = { type: 'none' };
      
      if (showTextConfig && showDesignConfig && selectedDesign) {
        customPayload = {
          type: 'both',
          textContent: customText.trim() || 'YOUR TEXT',
          textColor: textColour,
          designId: selectedDesign._id,
          customDesignUrl: selectedDesign.imageUrl,
          previewImageUrl: previewUrl
        };
      } else if (showTextConfig) {
        customPayload = {
          type: 'text',
          textContent: customText.trim() || 'YOUR TEXT',
          textColor: textColour,
          previewImageUrl: previewUrl
        };
      } else if (showDesignConfig && selectedDesign) {
        customPayload = {
          type: 'library_design',
          designId: selectedDesign._id,
          customDesignUrl: selectedDesign.imageUrl,
          previewImageUrl: previewUrl
        };
      }

      await api.post('/cart', {
        productId: product._id,
        size: selectedSize || 'N/A',
        colour: selectedColour || 'N/A',
        quantity: 1,
        customisation: customPayload
      });
      sessionStorage.removeItem('appliedPromo');
      navigate('/cart');
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to add to cart. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  };

  const selectedColourObj = product?.availableColours?.find(c => 
    (typeof c === 'string' && c === selectedColour) || 
    (c.name === selectedColour)
  );
  
  const currentImage = (selectedColourObj && typeof selectedColourObj === 'object' && selectedColourObj.image) 
    ? selectedColourObj.image 
    : (product?.baseImages?.[0] || '');

  const availableSizesForColour = (selectedColourObj && selectedColourObj.sizes?.length > 0) 
    ? selectedColourObj.sizes 
    : (product?.availableSizes || []);

  useEffect(() => {
    if (availableSizesForColour.length > 0 && !availableSizesForColour.includes(selectedSize)) {
      setSelectedSize(availableSizesForColour[0]);
    }
  }, [selectedColour, availableSizesForColour, selectedSize]);

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: 'calc(100vh - 64px - 200px)' }}>
      <BackButton />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'flex-start' }} className="product-grid">

        <div 
          ref={printAreaRef}
          style={{ backgroundColor: '#ffffff', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}
        >
          {currentImage ? (
            <img src={currentImage} alt={`${product.name} in ${selectedColour}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>No Image Available</span>
          )}

          {showTextConfig && (
            <Rnd
              size={{ width: textRnd.width, height: textRnd.height }}
              position={{ x: textRnd.x, y: textRnd.y }}
              onDragStop={(e, d) => setTextRnd(prev => ({ ...prev, x: d.x, y: d.y }))}
              onResizeStop={(e, direction, ref, delta, position) => {
                setTextRnd({
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  ...position,
                });
              }}
              bounds="parent"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(0,0,0,0.3)',
                cursor: 'move'
              }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: textColour,
                fontWeight: 'bold',
                fontSize: `${textRnd.height * 0.7}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                userSelect: 'none',
                textShadow: textColour === '#111111' ? '0px 0px 2px rgba(255,255,255,0.8)' : '0px 0px 2px rgba(0,0,0,0.5)'
              }}>
                {customText || 'YOUR TEXT'}
              </div>
            </Rnd>
          )}

          {showDesignConfig && selectedDesign && (
            <Rnd
              size={{ width: designRnd.width, height: designRnd.height }}
              position={{ x: designRnd.x, y: designRnd.y }}
              onDragStop={(e, d) => setDesignRnd(prev => ({ ...prev, x: d.x, y: d.y }))}
              onResizeStop={(e, direction, ref, delta, position) => {
                setDesignRnd({
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  ...position,
                });
              }}
              bounds="parent"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(0,0,0,0.3)',
                cursor: 'move'
              }}
            >
              <img src={selectedDesign.imageUrl} alt="custom design" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
            </Rnd>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
              {product.name} {selectedColour && `(${selectedColour})`}
            </h1>
            <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>₹{product.basePrice}</div>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowTextConfig(!showTextConfig)}
                className={`btn ${showTextConfig ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                {showTextConfig ? 'Remove Text' : 'Add Text'}
              </button>
              <button 
                onClick={() => setShowDesignConfig(!showDesignConfig)}
                className={`btn ${showDesignConfig ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                {showDesignConfig ? 'Remove Design' : 'Add Design'}
              </button>
            </div>

            {showTextConfig && (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Text Settings</h3>
                <input 
                  value={customText} 
                  onChange={e => setCustomText(e.target.value)} 
                  placeholder="Enter your text..." 
                  style={{ padding: '0.75rem', border: '1px solid var(--border-color)', outline: 'none' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Text Color</label>
                  <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <input type="color" value={textColour} onChange={e => setTextColour(e.target.value)} style={{ position: 'absolute', top: '-10px', left: '-10px', width: '50px', height: '50px', padding: '0', border: 'none', cursor: 'pointer' }} />
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drag and resize the box directly on the image.</p>
              </div>
            )}

            {showDesignConfig && (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Select Design</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {designs.map(design => (
                    <button 
                      key={design._id}
                      onClick={() => setSelectedDesign(design)}
                      style={{ 
                        aspectRatio: '1/1', 
                        padding: '0.5rem', 
                        border: `2px solid ${selectedDesign?._id === design._id ? 'var(--text-primary)' : 'var(--border-color)'}`,
                        backgroundColor: 'var(--bg-primary)',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                    >
                      <img src={design.imageUrl} alt={design.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                  {designs.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>No designs available. Admins can upload them in the dashboard.</span>}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drag and resize the design directly on the image.</p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Size</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {availableSizesForColour.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      border: `1px solid ${selectedSize === size ? 'var(--text-primary)' : 'var(--border-color)'}`,
                      backgroundColor: selectedSize === size ? 'var(--text-primary)' : 'transparent',
                      color: selectedSize === size ? 'var(--bg-primary)' : 'var(--text-primary)',
                      borderRadius: '2px',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Colour</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.availableColours?.map((colourObj, idx) => {
                  const colourName = typeof colourObj === 'string' ? colourObj : colourObj.name;
                  if (!colourName) return null;
                  return (
                    <button 
                      key={idx}
                      onClick={() => setSelectedColour(colourName)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        border: `1px solid ${selectedColour === colourName ? 'var(--text-primary)' : 'var(--border-color)'}`,
                        backgroundColor: selectedColour === colourName ? 'var(--text-primary)' : 'transparent',
                        color: selectedColour === colourName ? 'var(--bg-primary)' : 'var(--text-primary)',
                        borderRadius: '2px',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {colourName}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1rem' }}
              onClick={handleAddToCart}
              disabled={adding || (showDesignConfig && !selectedDesign)}
            >
              {adding ? 'Processing...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
