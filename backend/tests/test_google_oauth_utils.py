def test_get_google_oauth():
    # Test get_google_oauth function
    from app.utils.oauth.google_oauth import get_google_oauth

    oauth_instance = get_google_oauth()

    assert oauth_instance is not None
    assert hasattr(oauth_instance, 'google')
