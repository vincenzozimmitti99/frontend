const clsx = (...css: (string | undefined)[]) => {
	let tempcss = "";
	
	for(let i=0;i<css.length;i++){
		css[i] = css[i]?.trim();
		if(!css[i]) continue;

		if(i!==css.length)
			tempcss += css[i] + " ";
		else
			tempcss += css[i];
	}
	return tempcss.trim();
}

export default clsx;