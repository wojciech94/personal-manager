export const FormRow = ({ label, content, children, className }) => {
	return (
		<div className={`form-row ${className ? className : ''}`}>
			<div className='form-row-label'>{label}</div>
			<div className='form-row-content'>
				{content}
				{children}
			</div>
		</div>
	)
}
