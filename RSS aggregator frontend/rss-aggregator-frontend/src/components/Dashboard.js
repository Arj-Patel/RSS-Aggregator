import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
    const [feeds, setFeeds] = useState([]);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [followedFeedIds, setFollowedFeedIds] = useState([]);
    const [followedFeedFollowIds, setFollowedFeedFollowIds] = useState({});
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/v1/feeds')
            .then(response => {
                console.log(response.data);
                setFeeds(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    const handleFeedChange = (feedId) => {
        setSelectedFeed(feeds.find(feed => feed.id === feedId));
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setShowDropdown(true); // Show the dropdown when typing
    };

    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        axios.get('http://localhost:8080/v1/feed_follows', {
            headers: {
                'Authorization': `ApiKey ${apiKey}`
            }
        })
            .then(response => {
                // The response should be an array of objects, each with a feed_id property
                console.log(response.data);
                const feedIds = response.data.map(feedFollow => feedFollow.feed_id);
                setFollowedFeedIds(feedIds);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []); // Empty dependency array means this useEffect runs once when the component mounts


    const filteredFeeds = searchTerm ? feeds.filter(feed => feed.name.toLowerCase().startsWith(searchTerm.toLowerCase())) : feeds;

    useEffect(() => {
        if (selectedFeed) {
            axios.get(selectedFeed.url)
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    }, [selectedFeed]);

    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        axios.get('http://localhost:8080/v1/feed_follows', {
            headers: {
                'Authorization': `ApiKey ${apiKey}`
            }
        })
            .then(response => {
                const feedFollows = response.data;
                const newFollowedFeedFollowIds = {};
                for (let feedFollow of feedFollows) {
                    newFollowedFeedFollowIds[feedFollow.feed_id] = feedFollow.id;
                }
                setFollowedFeedFollowIds(newFollowedFeedFollowIds);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        axios.get('http://localhost:8080/v1/posts', {
            headers: {
                'Authorization': `ApiKey ${apiKey}`
            }
        })
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    const handleFollowFeed = (feedId) => {
        if (window.confirm('Are you sure you want to follow this feed?')) {
            const apiKey = localStorage.getItem('apiKey');
            axios.post('http://localhost:8080/v1/feed_follows', { feed_id: feedId }, {
                headers: {
                    'Authorization': `ApiKey ${apiKey}`
                }
            })
                .then(response => {
                    console.log(feedId);
                    setFollowedFeedIds([...followedFeedIds, feedId]); // Add feedId to followedFeedIds
                    setFollowedFeedFollowIds({ ...followedFeedFollowIds, [feedId]: response.data.id }); // Store the feed_follow_id
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    };

    const handleUnfollowFeed = (feedId) => {
        if (window.confirm('Are you sure you want to unfollow this feed?')) {
            const apiKey = localStorage.getItem('apiKey');
            axios.delete(`http://localhost:8080/v1/feed_follows/${followedFeedFollowIds[feedId]}`, {
                headers: {
                    'Authorization': `ApiKey ${apiKey}`
                }
            })
                .then(() => {
                    const newFollowedFeedIds = followedFeedIds.filter(id => id !== feedId);
                    setFollowedFeedIds(newFollowedFeedIds); // Remove feedId from followedFeedIds

                    const { [feedId]: value, ...remaining } = followedFeedFollowIds;
                    setFollowedFeedFollowIds(remaining); // Remove feed_follow_id from followedFeedFollowIds
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    };

    return (
        <div className="container">
            <h1>Dashboard</h1>
            <div className="search-bar-container">
                <input type="text" placeholder="Search feeds" value={searchTerm} onChange={handleSearchChange} />
                <button onClick={() => setShowDropdown(!showDropdown)}>▼</button>
            </div>
            {showDropdown && (
                <div className="dropdown">
                    {filteredFeeds.map(feed => (
                        <div key={feed.id}>
                            <span onClick={() => handleFeedChange(feed.id)}>
                                {feed.name}
                            </span>
                            {followedFeedIds.includes(feed.id) ? (
                                <button onClick={() => handleUnfollowFeed(feed.id)}>Unfollow</button>
                            ) : (
                                <button onClick={() => handleFollowFeed(feed.id)}>Follow</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <div className="post-list">
                {posts.map(post => (
                    <div key={post.id} className="post-title">
                        {post.title}
                    </div>
                ))}
            </div>
        </div>
    );
}