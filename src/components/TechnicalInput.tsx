import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert, Copy, Check } from 'lucide-react';

export type TechnicalFieldType = 'ip' | 'mac' | 'iot_code' | 'api_key' | 'port' | 'vlan';

export interface TechnicalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  type: TechnicalFieldType;
  allowMask?: boolean;
  helperText?: string;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

const VALIDATION_RULES: Record<TechnicalFieldType, { pattern: RegExp; placeholder: string; errorMsg: string; example: string }> = {
  ip: {
    pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    placeholder: "192.168.1.100",
    errorMsg: "Format IPv4 invalide (octets 0-255 requis)",
    example: "10.0.4.15"
  },
  mac: {
    pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    placeholder: "00:1A:2B:3C:4D:5E",
    errorMsg: "Format MAC invalide (6 octets hexadécimaux séparés par : ou -)",
    example: "00:1A:2B:3C:4D:5E"
  },
  iot_code: {
    pattern: /^[A-Z0-9_-]{6,32}$/i,
    placeholder: "SENSOR-PLC-X104",
    errorMsg: "Code IoT invalide (6 à 32 caractères alphanumériques _ -)",
    example: "NODE-FRA1-PUE"
  },
  api_key: {
    pattern: /^[A-Za-z0-9_-]{16,128}$/,
    placeholder: "sk_live_94829420842...",
    errorMsg: "Clé API / Token invalide (minimum 16 caractères)",
    example: "sk_live_..."
  },
  port: {
    pattern: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
    placeholder: "502 (Modbus) ou 47808 (BACnet)",
    errorMsg: "Port réseau TCP/UDP invalide (plage 1 - 65535)",
    example: "502"
  },
  vlan: {
    pattern: /^([1-9][0-9]{0,2}|[1-3][0-9]{3}|40[0-8][0-9]|409[0-4])$/,
    placeholder: "100",
    errorMsg: "ID VLAN invalide (plage 1 - 4094)",
    example: "20"
  }
};

export const TechnicalInput: React.FC<TechnicalInputProps> = ({
  label,
  type,
  allowMask,
  helperText,
  onValidationChange,
  className = "",
  value,
  defaultValue,
  onChange,
  ...props
}) => {
  const rule = VALIDATION_RULES[type] || VALIDATION_RULES.iot_code;
  const isMaskable = allowMask ?? (type === 'api_key' || type === 'iot_code');
  
  const [internalValue, setInternalValue] = useState<string>((value as string) || (defaultValue as string) || '');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [showValue, setShowValue] = useState<boolean>(!isMaskable);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(String(value));
      if (String(value).length > 0) {
        const valid = rule.pattern.test(String(value).trim());
        setIsValid(valid);
        onValidationChange?.(valid);
      }
    }
  }, [value, rule.pattern]);

  const handleValidation = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      setIsValid(true);
      onValidationChange?.(true);
      return;
    }
    const valid = rule.pattern.test(trimmed);
    setIsValid(valid);
    onValidationChange?.(valid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    setIsTouched(true);
    handleValidation(val);
    onChange?.(e);
  };

  const handleCopy = () => {
    if (internalValue) {
      navigator.clipboard.writeText(internalValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {/* En-tête du champ avec signal cognitif industriel */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          <span>{label}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-500/15 border border-yellow-500/40 text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-wider">
            {type.toUpperCase()}
          </span>
        </label>
        {isTouched && internalValue.length > 0 && (
          <span className={`text-[10px] font-mono flex items-center gap-1 ${isValid ? 'text-emerald-500' : 'text-red-500 font-bold'}`}>
            {isValid ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Format Valide</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Format Invalide</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Conteneur de saisie avec Jaune Électrique & Protection Anti-Regard */}
      <div className="relative flex items-center">
        <input
          type={isMaskable && !showValue ? "password" : "text"}
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          placeholder={props.placeholder || rule.placeholder}
          className={`w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-[#0c0c0e] border text-slate-900 dark:text-white transition-all outline-none ${
            isTouched && !isValid
              ? 'input-technical-invalid border-red-500 focus:border-red-600'
              : 'input-technical-warning border-yellow-500/80 focus:border-yellow-400'
          } ${isMaskable ? 'pr-20' : 'pr-9'}`}
          {...props}
        />

        {/* Boutons d'actions intégrés (Masquage & Copie) */}
        <div className="absolute right-2 flex items-center gap-1">
          {internalValue.length > 0 && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Copier la valeur"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {isMaskable && (
            <button
              type="button"
              onClick={() => setShowValue(!showValue)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={showValue ? "Masquer la donnée (Protection des regards)" : "Afficher en clair"}
            >
              {showValue ? <EyeOff className="w-3.5 h-3.5 text-yellow-400" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Message d'erreur ou Aide contextuelle */}
      {isTouched && !isValid && (
        <span className="text-[11px] text-red-500 font-mono flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{rule.errorMsg} (ex: {rule.example})</span>
        </span>
      )}
      {helperText && (isValid || !isTouched) && (
        <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default TechnicalInput;

