// Versión mejorada del efecto de fondo animado
document.addEventListener('DOMContentLoaded', function() {
    // Configuración optimizada
    const config = {
        nodeCount: 25, // Número reducido para mejor rendimiento
        maxDistance: 180,
        lineColor: 'rgb(8, 61, 90)', // Más transparente
        repelDistance: 120,
        mouseRepelForce: 0.15,
        nodeSpeed: 1.5
    };

    const nodes = [];
    let canvas, ctx;
    let mouseX = Infinity, mouseY = Infinity; // Usamos Infinity para desactivar inicialmente
    let canvasWidth, canvasHeight;

    // Función de inicialización
    function init() {
        canvas = document.getElementById('animatedBackground');
        if (!canvas) {
            console.warn('Canvas no encontrado - Efecto desactivado');
            return;
        }

        ctx = canvas.getContext('2d');
        setupCanvas();
        createNodes();
        setupEventListeners();
        startAnimation();
    }

    // Configuración del canvas
    function setupCanvas() {
        canvasWidth = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
    }

    // Creación de nodos
    function createNodes() {
        for (let i = 0; i < config.nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                vx: (Math.random() * 2 - 1) * config.nodeSpeed,
                vy: (Math.random() * 2 - 1) * config.nodeSpeed,
                size: Math.random() * 2 + 1
            });
        }
    }

    // Manejadores de eventos
    function setupEventListeners() {
        // Debounce para el resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                canvasWidth = canvas.width = window.innerWidth;
                canvasHeight = canvas.height = window.innerHeight;
            }, 100);
        });

        // Mouse move con throttling
        let mouseMoveTimeout;
        document.addEventListener('mousemove', function(e) {
            clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = setTimeout(function() {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }, 16); // ~60fps
        });

        // Reset mouse position cuando sale del documento
        document.addEventListener('mouseout', function() {
            mouseX = mouseY = Infinity;
        });
    }

    // Animación principal
    function startAnimation() {
        if (!nodes.length) return;

        function animate() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            nodes.forEach(node => updateNode(node));
            drawConnections();
            
            requestAnimationFrame(animate);
        }

        animate();
    }

    // Actualizar posición de nodos
    function updateNode(node) {
        // Interacción con el mouse
        if (isFinite(mouseX) && isFinite(mouseY)) {
            const dx = node.x - mouseX;
            const dy = node.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.repelDistance) {
                const force = config.mouseRepelForce * (1 - distance/config.repelDistance);
                node.vx += (dx/distance) * force;
                node.vy += (dy/distance) * force;
            }
        }
        
        // Movimiento
        node.x += node.vx;
        node.y += node.vy;
        
        // Rebote en bordes con amortiguación
        if (node.x < 0 || node.x > canvasWidth) {
            node.vx *= -0.8;
            node.x = node.x < 0 ? 0 : canvasWidth;
        }
        if (node.y < 0 || node.y > canvasHeight) {
            node.vy *= -0.8;
            node.y = node.y < 0 ? 0 : canvasHeight;
        }
    }

    // Dibujar conexiones entre nodos
    function drawConnections() {
        ctx.strokeStyle = config.lineColor;
        ctx.lineWidth = 0.7;
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const node1 = nodes[i];
                const node2 = nodes[j];
                const dx = node1.x - node2.x;
                const dy = node1.y - node2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.maxDistance) {
                    ctx.globalAlpha = 1 - (distance/config.maxDistance);
                    ctx.beginPath();
                    ctx.moveTo(node1.x, node1.y);
                    ctx.lineTo(node2.x, node2.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    // Iniciar
    init();
});