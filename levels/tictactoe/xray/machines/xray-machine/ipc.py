from procbridge import procbridge

_procBridgePort = 34567
_client = procbridge.ProcBridge("127.0.0.1", _procBridgePort)

def event(event, args):
	_client.request(event, args)
