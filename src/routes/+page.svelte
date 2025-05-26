<script>
	import {base} from '$app/paths';
</script>
<main>
	<img src="triangleSpaceLogo.png" alt="The logo of Triangle Space" style="height: auto; width: 65%;">
	<a href="{base}/current-project">Get Started</a>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #2b192e;
		color: #f5e8da;
	}

	a {
		width: 60%;
		height: 100px;
		color: #f5e8da;
		text-align: center;
		margin: 10px;
		padding: 10px;
		padding-top: 20px;
		background-color: #3c2a3d;
		text-decoration: none;
		font-size: clamp(40px, 70px, 100px);
		border-radius: 20px;	
	}
	a:hover {
		background-color: #4c3a4d;
	}
</style>