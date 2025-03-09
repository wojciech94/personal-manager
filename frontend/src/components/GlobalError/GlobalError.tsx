import { useRouteError } from 'react-router-dom'
import { useTranslation } from '../../contexts/TranslationContext'

export const GlobalError = () => {
	const error = useRouteError()
	const { t } = useTranslation()

	if (error instanceof Response) {
		let errorData: { message?: string } = {}
		try {
			if (!error.bodyUsed) {
				const text = error.statusText || t('unexpected_error')
				errorData.message = text
			}
		} catch {
			errorData.message = t('unexpected_error_occured')
		}

		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<h1>
					{t('error')} {error.status}
				</h1>
				<p>{errorData.message || t('error_while_processing')}</p>
			</div>
		)
	}

	if (error instanceof Error) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<h1>{t('something_went_wrong')}</h1>
				<p>{error.message}</p>
			</div>
		)
	}

	return (
		<div style={{ padding: '2rem', textAlign: 'center' }}>
			<h1>{t('unexpected_error_occured')}</h1>
		</div>
	)
}
