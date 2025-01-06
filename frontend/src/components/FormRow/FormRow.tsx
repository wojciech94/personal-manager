interface Props {
	label?: string
	content?: React.ReactNode
	children?: React.ReactNode
	className?: string
	required?: boolean
}

export const FormRow: React.FC<Props> = ({ label, content, children, className, required }): JSX.Element => {
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
