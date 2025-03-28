(
    fn executeCode data = (
      local result = undefined

      print ("executeCode data: " + (data as string))
      if (data != undefined and data["code"] != undefined) then (
        result = execute ("(" + data["code"] + ")")
        print ("executeCode result: " + (result as string))
		    print ("executeCode result class: " + ((classof result) as string))
      )
	  
      try (
        local pjson = python.import "json"
        local temp = pjson.dumps result
        result = pjson.loads temp
      ) catch (
        print ("executeCode could not serialize result: " + (getCurrentException() as string))
      )

      --
      result
    )
)