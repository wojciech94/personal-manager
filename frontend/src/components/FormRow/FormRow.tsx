import { FormRowProps } from './types'

export const FormRow: React.FC<FormRowProps> = ({ label, content, children, className, required }): JSX.Element => {
	return (
		<div className={`form-row ${className ? className : ''}`}>
			<div className={`form-row-label ${required ? 'required' : ''}`}>{label}</div>
			<div className='form-row-content'>
				{content}
				{children}
			</div>
		</div>
	)
}
