clearListener()

-- Unstable doesn't work properly

struct maxServerStruct (
    onclose = undefined,
    onerror = undefined,
    onmessage = undefined,

    -- private
    ipAddress = "127.0.0.1",
    port = 7603,
    tcpListener = undefined,
    clientSocket = undefined,
    backgroundWorker = undefined,

    fn _doWork sender args = (
        try (
            this._createServer()
            exit
        )
        catch(
            print ("server crashed or port " + (this.port as string) + " is already used")
            print (getCurrentException())
        )
    ),

    fn _createServer = (
        local dotNetIPAddress = (DotNetClass "System.Net.IPAddress").Parse this.ipAddress
        this.tcpListener = DotNetObject "System.Net.Sockets.TcpListener" dotNetIPAddress this.port
        this.tcpListener.Start()
        msgReceived = ""
        print ("listening on " + (this.ipAddress as string) + ":" + (this.port as string))
        while true do 
        (
            print("waiting for a client socket")
            this.clientSocket = this.tcpListener.AcceptSocket()
            print("client socket accepted")
            while msgReceived != "exit" do
            (
                print "here"
                    local sendByteStream = DotNetObject "System.Byte[]" 4096
                this.clientSocket.Receive sendByteStream
                        local encoding = DotnetClass "System.Text.UTF8Encoding"
                        msgReceived = trimright (encoding.UTF8.GetString(sendByteStream))

                        if msgReceived == "socketClosing" then (
                    print("closing socket")
                            this.clientSocket.Close()
                    exit
                        )
                else (
                    if msgReceived != "" then (
                            print("received : " + msgReceived)
                            this.send "message received"
                        -- execute msgReceived
                        try(
                                if this.onmessage != undefined do (
                                    this.onmessage msgReceived
                                )
                        ) catch (
                                error_str = "***" + getCurrentException() +"***\n" 
                                print(error_str)
                        )
                        
                        )
                    )
                )
            )
    ),

    fn start =
	(
        -- Stop any existing server first
        this.close()
        
        -- Create and configure the background worker
        this.backgroundWorker = dotNetObject "System.ComponentModel.BackgroundWorker"
        dotNet.addEventHandler this.backgroundWorker "DoWork" this._doWork
        this.backgroundWorker.WorkerSupportsCancellation = true
        
        -- Start the background worker
        this.backgroundWorker.RunWorkerAsync()
        
        format "Server started in background on port %\n" this.port
    ),

    fn close =
    (
        if (this.tcpListener != undefined ) do this.tcpListener.Stop()
        if (this.backgroundWorker != undefined) do this.backgroundWorker.dispose()
        
        -- Force garbage collection to help release resources
        gc light:false
        gc()
        
        format "Server stopped\n"
    ),

    fn send message =
    (
        if this.clientSocket != undefined and this.clientSocket.Connected then (
            --try (
                -- Convert string to bytes using UTF8
                local encoding = dotNetClass "System.Text.UTF8Encoding"
                local bytes = encoding.UTF8.GetBytes message
                
                -- Send the bytes using the correct socket reference
                this.clientSocket.Send bytes
                format "Sent: %\n" message
            /*)
            catch (
                local errorMsg = (getCurrentException() as string)
                format "Error sending message: %\n" errorMsg
                if this.onerror != undefined do (
                    this.onerror errorMsg
                )
            )*/
        )
    )    
)

fn processMessage msg = (
    local pcols = python.import "collections"
	local pjson = python.import "json"

    local payload = pjson.loads msg
    local scriptPath = payload["scriptPath"]
    local requestId = payload["requestId"]
    local url = payload["url"]
	
    eventHandler scriptPath requestId url
)

global maxServer
if (maxServer != undefined) do maxServer.close()

print "creating new maxServerStruct instance"
maxServer = maxServerStruct()
maxServer.onmessage = processMessage
maxServer.start()
