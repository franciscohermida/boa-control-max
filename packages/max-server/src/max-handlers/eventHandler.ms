(
	fn eventHandler scriptPath requestId url =
	(
		clearListener()
		local pcols = python.import "collections"
		local pjson = python.import "json"

		-- Create WebClient for HTTP requests
		local webClient = dotNetObject "System.Net.WebClient"
		webClient.Headers.Add "Content-Type" "application/json"	

		local inputUrl = url+"/api/request/getRequestInput/"+requestId
		local outputUrl = url+"/api/request/setRequestOutput/"+requestId

		try (
			-- Get the payload
			local payloadResponse = webClient.DownloadString inputUrl
			local payload = pjson.loads payloadResponse

			local input = undefined
			if payload["data"] != undefined then input = payload["data"]["input"]
			print ("input: " + (input as string))
			print (input != undefined)
			print (classof input)

			-- executing function
			local functionToExecute = (filein scriptPath)
			local data = functionToExecute input
			print ("data: " + (data as string))
			
			local response = pcols.OrderedDict()
			response["success"] = true
			response["data"] = data
			print response
			local responseJson = pjson.dumps response
			print responseJson

			local encoding = dotNetObject "System.Text.UTF8Encoding"
			local dataBytes = encoding.GetBytes responseJson
			webClient.UploadData outputUrl dataBytes
			--
			ok
		) catch (
			local response = pcols.OrderedDict()
			local error = getCurrentException()			
			print ("Error: " + error)
			response["success"] = false
			response["error"] = error
			local responseJson = pjson.dumps response

			local encoding = dotNetObject "System.Text.UTF8Encoding"
			local dataBytes = encoding.GetBytes responseJson
			webClient.UploadData outputUrl dataBytes
		)
	)
)