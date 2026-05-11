# LlegoYA: Concept & Discovery Document (CDD)

Este documento detalla el análisis de descubrimiento del cliente (Customer Discovery), define los arquetipos de usuarios principales y establece el encaje producto-mercado (Product-Market Fit) para LlegoYA.

---

## 👥 1. Arquetipos de Usuario (User Personas)

### Persona 1: "La Caserita" (Vendedora Informal)
- **Perfil:** Doña María (50 años). Vende desayunos, salteñas o verduras en el mercado tradicional (ej. La Cancha). Atiende su puesto de 6:00 AM a 2:00 PM.
- **Dolores (Pains):** Ve cómo baja su clientela joven porque "todos piden por celular ahora". No entiende de interfaces complejas, correos electrónicos o inventarios digitales. No confía en los bancos.
- **Jobs to be Done (JTBD):** "Quiero poder vender a la gente de las oficinas que ya no tiene tiempo de venir al mercado, pero sin tener que aprender a usar un sistema complicado o comprar una tablet cara."
- **Solución LlegoYA:** El Bot de WhatsApp para vendedoras. Ella solo recibe un mensaje: *"Pedido de 3 salteñas. Responde 1 para aceptar"*. Pagos consolidados en efectivo o QR simple.

### Persona 2: "El Chaski" (Repartidor / Delivery)
- **Perfil:** Luis (24 años). Estudiante universitario o padre de familia joven. Trabaja en su motocicleta 8-10 horas al día para apps como PedidosYa o Yango.
- **Dolores (Pains):** Inestabilidad. Las apps se quedan con una tajada gigante del envío. Soporte automatizado que nunca lo ayuda cuando tiene un problema. Se siente un número reemplazable.
- **Jobs to be Done (JTBD):** "Quiero generar ingresos con mi moto de manera predecible, donde sienta que mi esfuerzo es mío y tenga un respaldo si sufro un accidente menor."
- **Solución LlegoYA:** El Modelo de Cooperativa. Luis paga una mensualidad (ej. Bs. 150) por acceso al sistema. El 100% de lo que el cliente paga por el delivery se va al bolsillo de Luis. Voto en asamblea digital.

### Persona 3: "El Urbano Consciente" (Consumidor Final)
- **Perfil:** Andrea (28 años). Oficinista en el centro de la ciudad. Compra frecuentemente por delivery.
- **Dolores (Pains):** Pagar precios inflados (+30% sobre el precio de menú) por un simple almuerzo en apps tradicionales. Extraña la comida "casera" y económica de los mercados, pero no tiene tiempo para ir.
- **Jobs to be Done (JTBD):** "Quiero comer barato, rico y local, apoyando a mi comunidad, pero con la misma conveniencia de pedir desde una app hasta mi escritorio."
- **Solución LlegoYA:** Interfaz moderna (Qatu) que le permite navegar por los mercados tradicionales y pedir un "Almuerzo Completo" por Bs. 15 + envío justo. Visibilidad de que su dinero apoya directamente al mercado local.

---

## 🎯 2. Value Proposition Canvas (Propuesta de Valor)

### Para Comercios y Mercados (Supply)
*   **Aliviadores de Frustraciones (Pain Relievers):** Comisión dramáticamente más baja (4-8% vs 30%). No requiere hardware nuevo. Soporte técnico humano, local y por WhatsApp.
*   **Creadores de Alegrías (Gain Creators):** Acceso instantáneo a miles de clientes urbanos. Posibilidad de recibir pagos digitales fácilmente (QR). Herramienta de fidelización de clientes.
*   **Servicio:** Plataforma de gestión hiper-simplificada (Web PWA o WhatsApp Bot).

### Para Consumidores (Demand)
*   **Aliviadores de Frustraciones:** Precios no inflados en los menús. Transparencia de saber exactamente a dónde va su dinero (repartidor vs. restaurante). 
*   **Creadores de Alegrías:** Acceso a la comida auténtica y tradicional del mercado. Velocidad de entrega respaldada por repartidores motivados.
*   **Servicio:** App móvil rápida, limpia, con identidad boliviana y pagos integrados (LlegoPay).

---

## 🛡️ 3. Core Features & Minimum Viable Product (MVP)

Para lograr el Product-Market Fit inicial en la Etapa 1, LlegoYA se enfocará exclusivamente en estas funcionalidades centrales:

1.  **Catálogo Digital de Mercado (Frontend App):** Explorador de puestos categorizados por mercado geográfico.
2.  **Sistema de Confirmación por WhatsApp (Backend):** Puente asimétrico de comunicación para vendedoras informales.
3.  **Algoritmo de Asignación Justa (Logística):** Emparejamiento de pedidos dando prioridad a los repartidores-socios mejor calificados por zona.
4.  **Checkout Transparente:** UI que muestra el desglose exacto: Costo Producto + Tarifa Chaski (100% Repartidor) + Tarifa LlegoYA de Mantenimiento.

---

## 📊 4. Métricas de Validación del CDD (Próximos 3 Meses)
Para validar que estos arquetipos son correctos, buscaremos los siguientes hitos de tracción en la prueba piloto:
*   **Vendedoras:** Tasa de aceptación > 60% al hacer onboarding puerta a puerta en La Cancha. Tasa de retención mensual (vendedoras activas que reciben al menos 1 pedido semanal) > 80%.
*   **Repartidores:** Crecimiento viral (Word of Mouth) con un CAC (Costo de Adquisición) casi cero. Formar un equipo sólido de 30 Chaskis iniciales.
*   **Consumidores:** Costo de Adquisición de Usuario (CAC) < $3 USD. Ticket promedio inicial > Bs. 45.

*Documento Preparado para Ronda Pre-Semilla y Validación Operativa. Etapa: Discovery.*
