import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, TranslationKey, translations } from '../translations'

interface TranslationContextType {
	language: Language
	setLanguage: (lang: Language) => void
	t: (key: TranslationKey) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
	const [language, setLanguage] = useState<Language>(() => {
		const savedLang = localStorage.getItem('language') as Language
		return savedLang && savedLang in translations ? savedLang : 'en'
	})

	useEffect(() => {
		localStorage.setItem('language', language)
	}, [language])

	const t = (key: TranslationKey) => translations[language][key]

	return <TranslationContext.Provider value={{ language, setLanguage, t }}>{children}</TranslationContext.Provider>
}

export const useTranslation = () => {
	const context = useContext(TranslationContext)
	if (!context) throw new Error('useTranslation must be used within TranslationProvider')
	return context
}
