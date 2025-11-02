// Form Validator Centralizzato
// Sistema di validazione input per tutti i form dell'applicazione Vendemmia Meccanizzata

/**
 * Tipo di validazione
 */
const ValidationType = {
    REQUIRED: 'required',
    EMAIL: 'email',
    NUMBER: 'number',
    MIN_VALUE: 'minValue',
    MAX_VALUE: 'maxValue',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern',
    DATE: 'date',
    PHONE: 'phone'
};

/**
 * Validazione campi form
 */
class FormValidator {
    constructor(formElement, options = {}) {
        this.form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
        this.options = {
            validateOnInput: options.validateOnInput !== false, // Default: true
            validateOnBlur: options.validateOnBlur !== false, // Default: true
            showErrorsInline: options.showErrorsInline !== false, // Default: true
            errorClass: options.errorClass || 'field-error',
            successClass: options.successClass || 'field-success',
            ...options
        };
        this.errors = {};
        this.validations = {};
    }

    /**
     * Aggiungi regola di validazione per un campo
     * @param {string} fieldName - Nome del campo (name o id)
     * @param {Array} rules - Array di regole di validazione
     */
    addRule(fieldName, rules) {
        this.validations[fieldName] = rules;
        
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (!field) {
            console.warn(`Campo non trovato: ${fieldName}`);
            return;
        }

        // Aggiungi event listeners
        if (this.options.validateOnInput) {
            field.addEventListener('input', () => this.validateField(fieldName));
        }
        if (this.options.validateOnBlur) {
            field.addEventListener('blur', () => this.validateField(fieldName));
        }
    }

    /**
     * Valida un singolo campo
     * @param {string} fieldName - Nome del campo
     * @returns {boolean} - true se valido
     */
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (!field) {
            console.warn(`Campo non trovato per validazione: ${fieldName}`);
            return false;
        }

        const value = field.value ? field.value.trim() : '';
        const rules = this.validations[fieldName] || [];
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
            const validation = this.validateRule(value, rule, field);
            if (!validation.isValid) {
                isValid = false;
                errorMessage = validation.message;
                break; // Stop al primo errore
            }
        }

        // Aggiorna stato campo
        this.updateFieldState(field, isValid, errorMessage);
        this.errors[fieldName] = isValid ? null : errorMessage;

        return isValid;
    }

    /**
     * Valida una regola specifica
     * @param {string} value - Valore da validare
     * @param {Object} rule - Regola di validazione
     * @param {HTMLElement} field - Elemento campo
     * @returns {Object} - {isValid: boolean, message: string}
     */
    validateRule(value, rule, field) {
        // Skip validazione se campo vuoto (tranne required)
        // Se il campo è vuoto e non è required, passa la validazione
        if ((!value || value.trim() === '') && rule.type !== ValidationType.REQUIRED) {
            return { isValid: true, message: '' };
        }

        switch (rule.type) {
            case ValidationType.REQUIRED:
                if (!value) {
                    return {
                        isValid: false,
                        message: rule.message || 'Questo campo è obbligatorio'
                    };
                }
                break;

            case ValidationType.EMAIL:
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return {
                        isValid: false,
                        message: rule.message || 'Inserisci un indirizzo email valido'
                    };
                }
                break;

            case ValidationType.NUMBER:
                if (isNaN(value) || value === '') {
                    return {
                        isValid: false,
                        message: rule.message || 'Inserisci un numero valido'
                    };
                }
                break;

            case ValidationType.MIN_VALUE:
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < rule.value) {
                    return {
                        isValid: false,
                        message: rule.message || `Il valore minimo è ${rule.value}`
                    };
                }
                break;

            case ValidationType.MAX_VALUE:
                const numValue2 = parseFloat(value);
                if (isNaN(numValue2) || numValue2 > rule.value) {
                    return {
                        isValid: false,
                        message: rule.message || `Il valore massimo è ${rule.value}`
                    };
                }
                break;

            case ValidationType.MIN_LENGTH:
                if (value.length < rule.value) {
                    return {
                        isValid: false,
                        message: rule.message || `Minimo ${rule.value} caratteri richiesti`
                    };
                }
                break;

            case ValidationType.MAX_LENGTH:
                if (value.length > rule.value) {
                    return {
                        isValid: false,
                        message: rule.message || `Massimo ${rule.value} caratteri consentiti`
                    };
                }
                break;

            case ValidationType.PATTERN:
                const regex = new RegExp(rule.value);
                if (!regex.test(value)) {
                    return {
                        isValid: false,
                        message: rule.message || 'Formato non valido'
                    };
                }
                break;

            case ValidationType.DATE:
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return {
                        isValid: false,
                        message: rule.message || 'Inserisci una data valida'
                    };
                }
                if (rule.minDate && date < new Date(rule.minDate)) {
                    return {
                        isValid: false,
                        message: rule.message || `La data deve essere successiva a ${new Date(rule.minDate).toLocaleDateString('it-IT')}`
                    };
                }
                if (rule.maxDate && date > new Date(rule.maxDate)) {
                    return {
                        isValid: false,
                        message: rule.message || `La data deve essere precedente a ${new Date(rule.maxDate).toLocaleDateString('it-IT')}`
                    };
                }
                break;

            case ValidationType.PHONE:
                // Valida solo se il campo ha un valore
                if (value && value.trim().length > 0) {
                    const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
                    if (!phoneRegex.test(value)) {
                        return {
                            isValid: false,
                            message: rule.message || 'Inserisci un numero di telefono valido (minimo 7 caratteri)'
                        };
                    }
                }
                break;

            default:
                console.warn(`Tipo di validazione sconosciuto: ${rule.type}`);
        }

        return { isValid: true, message: '' };
    }

    /**
     * Aggiorna lo stato visivo del campo
     * @param {HTMLElement} field - Elemento campo
     * @param {boolean} isValid - Se il campo è valido
     * @param {string} errorMessage - Messaggio di errore
     */
    updateFieldState(field, isValid, errorMessage) {
        // Rimuovi classi precedenti
        field.classList.remove(this.options.errorClass, this.options.successClass);
        
        // Rimuovi messaggio errore precedente
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const fieldValue = field.value ? field.value.trim() : '';
        
        // Campo vuoto e non richiesto - stato neutro (nessun bordo)
        if (!errorMessage && !fieldValue) {
            return;
        }

        if (isValid && fieldValue) {
            // Mostra successo solo se il campo ha un valore E è valido
            field.classList.add(this.options.successClass);
        } else if (!isValid && errorMessage) {
            // Mostra errore se non valido e c'è un messaggio di errore
            field.classList.add(this.options.errorClass);
            
            if (this.options.showErrorsInline && errorMessage) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = errorMessage;
                errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px;';
                
                // Inserisci dopo il campo o nel parent
                if (field.nextSibling) {
                    field.parentElement.insertBefore(errorDiv, field.nextSibling);
                } else {
                    field.parentElement.appendChild(errorDiv);
                }
            }
        }
        // Se isValid è true ma il campo è vuoto, non mostrare nulla (stato neutro)
    }

    /**
     * Valida tutti i campi del form
     * @returns {boolean} - true se tutto valido
     */
    validate() {
        let isValid = true;
        
        for (const fieldName in this.validations) {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Ottieni tutti gli errori
     * @returns {Object} - Oggetto con errori per campo
     */
    getErrors() {
        return { ...this.errors };
    }

    /**
     * Reset validazione
     */
    reset() {
        this.errors = {};
        const fields = this.form.querySelectorAll(`.${this.options.errorClass}, .${this.options.successClass}`);
        fields.forEach(field => {
            field.classList.remove(this.options.errorClass, this.options.successClass);
        });
        
        const errorMessages = this.form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
}

// Funzioni helper per validazioni comuni
window.validateRequired = (value) => {
    return value && value.trim().length > 0;
};

window.validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

window.validateNumber = (value, min = null, max = null) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
};

window.validatePhone = (value) => {
    const phoneRegex = /^[\d\s\+\-\(\)]{7,15}$/;
    return phoneRegex.test(value);
};

window.validateDate = (value, minDate = null, maxDate = null) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    if (minDate && date < new Date(minDate)) return false;
    if (maxDate && date > new Date(maxDate)) return false;
    return true;
};

// Esponi classe globalmente
window.FormValidator = FormValidator;
window.ValidationType = ValidationType;

// Aggiungi stili CSS (solo se non già aggiunti)
if (!document.getElementById('form-validator-styles')) {
    const validatorStyle = document.createElement('style');
    validatorStyle.id = 'form-validator-styles';
    validatorStyle.textContent = `
        .field-error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }
        
        .field-success {
            border-color: #28a745 !important;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
        }
        
        .error-message {
            color: #dc3545;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        }
        
        .field-error:focus {
            border-color: #dc3545;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        
        .field-success:focus {
            border-color: #28a745;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
        }
    `;

    // Aggiungi stili al documento quando disponibile
    if (document.head) {
        document.head.appendChild(validatorStyle);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            if (!document.getElementById('form-validator-styles')) {
                document.head.appendChild(validatorStyle);
            }
        });
    }
}

console.log('✅ Form Validator caricato correttamente');

