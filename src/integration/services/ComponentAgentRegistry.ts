import type { ComponentAgent } from '../types/ComponentAgentTypes'

// ComponentAgent hardcodeado para testing - Landing Page Bancario
export const LANDING_COMPONENT_AGENT: ComponentAgent = {
  // Core
  id: 'landing-banking-001',
  name: 'Landing Page Bancario',
  specialization: 'landing',
  
  // Definition
  objective: 'Generar una página de aterrizaje atractiva para captación de prospectos de tarjetas de crédito',
  description: 'ComponentAgent especializado en landing pages bancarias con ofertas personalizadas y call-to-action optimizados',
  
  // Tasks
  tasks: [
    {
      id: 'analyze_user_segment',
      name: 'Analizar Segmento Usuario',
      description: 'Determinar el perfil del usuario para personalizar la oferta',
      completed: false
    },
    {
      id: 'generate_offer',
      name: 'Generar Oferta Personalizada',
      description: 'Crear oferta específica basada en el segmento identificado',
      completed: false
    },
    {
      id: 'render_landing',
      name: 'Renderizar Landing Page',
      description: 'Mostrar la página final con la oferta personalizada',
      completed: false
    }
  ],
  
  // Tools
  tools: [
    {
      id: 'user_segment_api',
      name: 'API Segmentación Usuario',
      type: 'api_call',
      endpoint: 'https://api.banco.com/segmentation',
      method: 'POST'
    },
    {
      id: 'offers_engine',
      name: 'Motor de Ofertas',
      type: 'banking',
      endpoint: 'https://api.banco.com/offers/calculate'
    },
    {
      id: 'brand_assets',
      name: 'Assets de Marca',
      type: 'transformation',
      parameters: { brand: 'bradescard', theme: 'premium' }
    }
  ],
  
  // Actions
  actions: [
    {
      id: 'apply_now',
      name: 'Solicitar Ahora',
      type: 'button_click',
      target: '#apply-button',
      handler: 'handleApplyClick',
      tools: ['user_segment_api', 'offers_engine']
    },
    {
      id: 'learn_more',
      name: 'Conocer Más',
      type: 'button_click',
      target: '#learn-more-button',
      handler: 'handleLearnMoreClick'
    }
  ],
  
  // Inputs
  inputs: [
    {
      id: 'user_profile',
      name: 'Perfil Usuario',
      type: 'object',
      required: false,
      description: 'Datos del usuario si están disponibles',
      defaultValue: { segment: 'unknown', age: null }
    },
    {
      id: 'campaign_code',
      name: 'Código de Campaña',
      type: 'text',
      required: false,
      description: 'Código de campaña publicitaria',
      defaultValue: 'default'
    }
  ],
  
  // Outputs
  outputs: [
    {
      id: 'user_interest',
      name: 'Interés del Usuario',
      type: 'text',
      description: 'Nivel de interés detectado: high, medium, low'
    },
    {
      id: 'selected_offer',
      name: 'Oferta Seleccionada',
      type: 'object',
      description: 'Detalles de la oferta que más llamó la atención'
    },
    {
      id: 'next_step',
      name: 'Siguiente Paso',
      type: 'text',
      description: 'Acción recomendada: apply, learn_more, exit'
    }
  ],
  
  // Vista HTML
  htmlView: `
    <div class="banking-landing-container">
      <!-- Header -->
      <div class="landing-header">
        <div class="brand-logo">
          <img src="/assets/bradescard-logo.png" alt="Bradescard" />
        </div>
        <div class="offer-highlight">
          <span class="offer-badge">🎯 Oferta Especial</span>
        </div>
      </div>
      
      <!-- Hero Section -->
      <div class="hero-section">
        <h1 class="hero-title">¡Tu Tarjeta de Crédito Ideal te Está Esperando!</h1>
        <p class="hero-subtitle">
          Aprovecha beneficios exclusivos diseñados para tu estilo de vida
        </p>
        
        <!-- Offer Card -->
        <div class="offer-card">
          <div class="offer-main">
            <h2>Tarjeta Bradescard Premium</h2>
            <div class="offer-benefits">
              <div class="benefit">
                <span class="benefit-icon">💳</span>
                <span>Sin anualidad el primer año</span>
              </div>
              <div class="benefit">
                <span class="benefit-icon">🎁</span>
                <span>20% descuento en Starbucks</span>
              </div>
              <div class="benefit">
                <span class="benefit-icon">🏪</span>
                <span>4 meses sin intereses</span>
              </div>
            </div>
          </div>
          
          <!-- CTA Buttons -->
          <div class="cta-section">
            <button id="apply-button" class="btn-primary">
              🚀 Solicitar Ahora
            </button>
            <button id="learn-more-button" class="btn-secondary">
              📋 Conocer Más
            </button>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="landing-footer">
        <p class="legal-text">
          * Sujeto a aprobación crediticia. Aplican términos y condiciones.
        </p>
      </div>
    </div>
    
    <style>
      .banking-landing-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: white;
      }
      
      .landing-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }
      
      .brand-logo img {
        height: 40px;
      }
      
      .offer-badge {
        background: #ff6b6b;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9em;
        font-weight: bold;
      }
      
      .hero-section {
        text-align: center;
      }
      
      .hero-title {
        font-size: 2.5em;
        margin-bottom: 16px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .hero-subtitle {
        font-size: 1.2em;
        margin-bottom: 40px;
        opacity: 0.9;
      }
      
      .offer-card {
        background: rgba(255,255,255,0.95);
        color: #333;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        margin-bottom: 30px;
      }
      
      .offer-main h2 {
        color: #2c3e50;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .offer-benefits {
        margin: 20px 0;
      }
      
      .benefit {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 1.1em;
      }
      
      .benefit-icon {
        margin-right: 12px;
        font-size: 1.3em;
      }
      
      .cta-section {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 25px;
      }
      
      .btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      .btn-primary:hover {
        transform: translateY(-2px);
      }
      
      .btn-secondary {
        background: transparent;
        color: #667eea;
        border: 2px solid #667eea;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 1.1em;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-secondary:hover {
        background: #667eea;
        color: white;
      }
      
      .landing-footer {
        text-align: center;
        margin-top: 40px;
      }
      
      .legal-text {
        font-size: 0.8em;
        opacity: 0.7;
      }
    </style>
  `,
  
  // Metadata
  version: '1.0.0',
  createdAt: '2025-08-23T17:30:00Z',
  updatedAt: '2025-08-23T17:30:00Z',
  status: 'active'
}
