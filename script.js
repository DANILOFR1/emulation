document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const concentration1 = document.getElementById('concentration1');
    const concentration2 = document.getElementById('concentration2');
    const concentration3 = document.getElementById('concentration3');
    const runSimulationBtn = document.getElementById('runSimulation');
    const resultContainer = document.getElementById('result');
    const loadingContainer = document.getElementById('loading');
    const resultMessage = document.getElementById('resultMessage');
    const attemptsLeftElement = document.getElementById('attemptsLeft');
    const progressBar = document.querySelector('.progress');
    const animationContainer = document.getElementById('animationContainer');
    
    // Configurações do jogo
    const correctFormula = [12, 40, 53]; // Fórmula correta pré-definida
    const maxAttempts = 10;
    let attempts = 0;
    let isSimulationRunning = false;
    let animationElements = [];
    
    // Função para validar os inputs
    function validateInputs() {
        const values = [
            parseInt(concentration1.value),
            parseInt(concentration2.value),
            parseInt(concentration3.value)
        ];
        
        return values.every(value => !isNaN(value) && value >= 0 && value <= 99);
    }
    
    // Função para verificar se a fórmula está correta
    function checkFormula() {
        const values = [
            parseInt(concentration1.value),
            parseInt(concentration2.value),
            parseInt(concentration3.value)
        ];
        
        return values[0] === correctFormula[0] && 
               values[1] === correctFormula[1] && 
               values[2] === correctFormula[2];
    }
    
    // Função para atualizar a barra de progresso durante a simulação
    function updateProgressBar(progress) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Função para criar os elementos da animação 2D
    function createAnimationElements() {
        // Limpar qualquer animação anterior
        animationContainer.innerHTML = '';
        animationElements = [];
        
        // Criar bactéria (elemento vermelho)
        const bacteria = document.createElement('div');
        bacteria.className = 'bacteria';
        bacteria.style.left = '50%';
        bacteria.style.top = '50%';
        bacteria.style.transform = 'translate(-50%, -50%)';
        animationContainer.appendChild(bacteria);
        
        // Criar os anticorpos (elementos azuis) baseados nos valores inseridos
        const values = [
            parseInt(concentration1.value) || 1,
            parseInt(concentration2.value) || 1,
            parseInt(concentration3.value) || 1
        ];
        
        // Normalizar os valores para usar na animação
        const total = values.reduce((sum, val) => sum + val, 0);
        const normalizedValues = values.map(val => Math.max(5, Math.min(30, (val / total) * 100)));
        
        // Criar anticorpos baseados nos valores normalizados
        for (let i = 0; i < 3; i++) {
            const size = normalizedValues[i];
            const antibody = document.createElement('div');
            antibody.className = 'antibody';
            antibody.style.width = `${size}px`;
            antibody.style.height = `${size}px`;
            
            // Posições iniciais diferentes para cada anticorpo
            const angles = [0, 120, 240];
            const radius = 80;
            const angle = angles[i] * (Math.PI / 180);
            
            const left = 50 + radius * Math.cos(angle);
            const top = 50 + radius * Math.sin(angle);
            
            antibody.style.left = `${left}px`;
            antibody.style.top = `${top}px`;
            
            // Adicionar delay na animação para movimento assíncrono
            antibody.style.animationDelay = `${i * 0.5}s`;
            
            animationContainer.appendChild(antibody);
            animationElements.push(antibody);
        }
        
        return animationElements;
    }
    
    // Função para animar a colisão dos anticorpos com a bactéria (quando a fórmula está correta)
    function animateCollision(isCorrect) {
        if (!isCorrect) return;
        
        const bacteria = document.querySelector('.bacteria');
        
        // Animar anticorpos se aproximando da bactéria
        animationElements.forEach((antibody, index) => {
            setTimeout(() => {
                antibody.style.animation = 'none';
                antibody.style.transition = 'all 1s ease-in';
                antibody.style.left = '50%';
                antibody.style.top = '50%';
                antibody.style.transform = 'translate(-50%, -50%)';
                antibody.style.opacity = '0.9';
                
                // Último anticorpo causa a "explosão" da bactéria
                if (index === animationElements.length - 1) {
                    setTimeout(() => {
                        bacteria.style.transition = 'all 0.5s ease-out';
                        bacteria.style.transform = 'translate(-50%, -50%) scale(2)';
                        bacteria.style.opacity = '0';
                    }, 500);
                }
            }, index * 500);
        });
    }
    
    // Função que simula o processamento por aproximadamente 30 segundos
    function runSimulation() {
        return new Promise(resolve => {
            let progress = 0;
            const totalSteps = 600; // 600 steps for 30 seconds (50ms * 600 = 30000ms)
            const increment = 100 / totalSteps;
            
            resultContainer.classList.remove('hidden');
            loadingContainer.style.display = 'block';
            resultMessage.style.display = 'none';
            attemptsLeftElement.style.display = 'none';
            
            // Criar elementos da animação 2D
            createAnimationElements();
            
            // Atualiza a barra de progresso a cada 50ms
            const interval = setInterval(() => {
                progress += increment;
                updateProgressBar(Math.min(progress, 100));
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Verifica se a fórmula está correta para animar a colisão
                    const isCorrect = checkFormula();
                    animateCollision(isCorrect);
                    
                    // Esconde a barra de progresso após completar
                    setTimeout(() => {
                        loadingContainer.style.display = 'none';
                        resultMessage.style.display = 'block';
                        attemptsLeftElement.style.display = 'block';
                        resolve();
                    }, isCorrect ? 3000 : 500); // Espera a animação de colisão terminar se estiver correto
                }
            }, 50);
        });
    }
    
    // Função para mostrar o resultado da simulação
    function showResult(isCorrect) {
        attempts++;
        
        if (isCorrect) {
            // Fórmula correta
            resultMessage.textContent = "✅ Simulação bem-sucedida! A bactéria foi neutralizada com sucesso. A humanidade foi salva.";
            resultMessage.classList.add('success');
            resultMessage.classList.remove('error');
            
            // Adiciona mensagem de agradecimento
            const thankYouMsg = document.createElement('p');
            thankYouMsg.textContent = "Obrigado por jogar Protocolo Sigma — Um jogo artesanal investigativo.";
            thankYouMsg.style.marginTop = "15px";
            resultMessage.appendChild(thankYouMsg);
            
            // Desabilita inputs e botões
            disableInputs();
            attemptsLeftElement.style.display = 'none';
        } else {
            // Fórmula incorreta
            resultMessage.textContent = "❌ Combinação ineficaz. Bactéria ainda ativa.";
            resultMessage.classList.add('error');
            resultMessage.classList.remove('success');
            
            const attemptsLeft = maxAttempts - attempts;
            attemptsLeftElement.textContent = `Tentativas restantes: ${attemptsLeft}`;
            
            // Verifica se acabaram as tentativas
            if (attempts >= maxAttempts) {
                resultMessage.textContent = "☠️ Todas as tentativas falharam. A bactéria se espalhou globalmente. A humanidade não resistiu.";
                disableInputs();
                attemptsLeftElement.style.display = 'none';
            }
        }
    }
    
    // Função para desabilitar os inputs e o botão
    function disableInputs() {
        concentration1.disabled = true;
        concentration2.disabled = true;
        concentration3.disabled = true;
        runSimulationBtn.disabled = true;
    }
    
    // Event Listener para o botão "Executar Simulação"
    runSimulationBtn.addEventListener('click', async () => {
        if (isSimulationRunning) return;
        
        if (!validateInputs()) {
            alert("Por favor, insira valores válidos entre 0 e 99 para todas as concentrações.");
            return;
        }
        
        isSimulationRunning = true;
        runSimulationBtn.disabled = true;
        
        // Executa a simulação (animação de 30 segundos)
        await runSimulation();
        
        // Verifica o resultado e mostra
        const isCorrect = checkFormula();
        showResult(isCorrect);
        
        runSimulationBtn.disabled = isCorrect || attempts >= maxAttempts;
        isSimulationRunning = false;
    });
    
    // Permite que o usuário pressione Enter para executar a simulação
    [concentration1, concentration2, concentration3].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !isSimulationRunning && !runSimulationBtn.disabled) {
                runSimulationBtn.click();
            }
        });
    });
}); 