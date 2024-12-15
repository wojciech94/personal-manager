export const FormRow = ({ label, content, children, className, required }) => {
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
