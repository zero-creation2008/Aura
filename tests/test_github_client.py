from github.self_improve import GitHubClient, GitHubError
class Response:
    ok=True; content=b"{}"
    def json(self): return {"check_runs":[{"status":"completed","conclusion":"success"}]}
class Session:
    def request(self, *args, **kwargs): return Response()
def test_client_uses_configured_rest_api():
    client=GitHubClient("token", "owner/repo", Session())
    assert client.checks("abc")["check_runs"][0]["conclusion"] == "success"
def test_client_refuses_missing_credentials():
    try: GitHubClient("", "", Session()).repository_state()
    except GitHubError: return
    assert False
